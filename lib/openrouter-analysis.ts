import { File } from 'expo-file-system';
import { ImagePickerAsset } from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';

import { demoAnalysisContext } from '@/constants/analysis-context';
import { type PatientProfile, type ReminderType, type SceneDescription } from '@/constants/care-data';

type AnalysisStage = 'extracting' | 'describing' | 'reasoning';
type StageReporter = (stage: AnalysisStage, message: string) => void;

type FrameSample = {
  index: number;
  timeMs: number;
  uri: string;
  mimeType: string;
  base64: string;
};

type SceneDescriptionResponse = {
  scenes: Array<{
    index: number;
    description: string;
  }>;
};

type ReasonedAnalysis = {
  observedSummary: string;
  category: string;
  status: string;
  observedActivity: string;
  systemInterpretation: string;
  suggestedReminder: string;
  reminderEnabled: boolean;
  reminderType: ReminderType;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const OPENROUTER_MODEL = 'google/gemini-2.5-flash';
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_FRAME_COUNT = 10;

function getOpenRouterApiKey() {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing OpenRouter API key. Add EXPO_PUBLIC_OPENROUTER_API_KEY to your local .env file.'
    );
  }

  return apiKey;
}

function buildFrameTimestamps(durationMs: number | null | undefined, frameCount = DEFAULT_FRAME_COUNT) {
  const safeDurationMs = Math.max(durationMs ?? 10000, 1000);

  return Array.from({ length: frameCount }, (_, index) => {
    const progress = (index + 0.5) / frameCount;
    return Math.max(0, Math.round(safeDurationMs * progress) - 1);
  });
}

function inferImageMimeType(uri: string) {
  const normalizedUri = uri.toLowerCase();

  if (normalizedUri.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedUri.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

async function extractFramesFromVideo(
  asset: ImagePickerAsset,
  onStageChange: StageReporter
): Promise<FrameSample[]> {
  onStageChange('extracting', 'Sampling 10 frames from the uploaded video.');

  const timestamps = buildFrameTimestamps(asset.duration);
  const frames: FrameSample[] = [];

  for (const [index, timeMs] of timestamps.entries()) {
    const frame = await VideoThumbnails.getThumbnailAsync(asset.uri, {
      quality: 0.55,
      time: timeMs,
    });
    const file = new File(frame.uri);

    frames.push({
      index: index + 1,
      timeMs,
      uri: frame.uri,
      mimeType: inferImageMimeType(frame.uri),
      base64: await file.base64(),
    });
  }

  return frames;
}

function getResponseText(payload: OpenRouterResponse) {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part.text ?? '')
      .join('')
      .trim();
  }

  return '';
}

async function callOpenRouter<T>(body: object): Promise<T> {
  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getOpenRouterApiKey()}`,
      'Content-Type': 'application/json',
      'X-Title': 'APSC103 Cognitive Decline Demo',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as OpenRouterResponse;

  if (!response.ok || payload.error?.message) {
    throw new Error(payload.error?.message || 'OpenRouter request failed.');
  }

  const text = getResponseText(payload);

  if (!text) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return JSON.parse(text) as T;
}

async function describeScenes(frames: FrameSample[], onStageChange: StageReporter) {
  onStageChange('describing', 'Sending the 10 sampled frames to OpenRouter for scene descriptions.');

  const userContent = [
    {
      type: 'text',
      text: [
        'You are describing a single uploaded video that has already been split into exactly 10 still frames.',
        'Treat the frames as chronological snapshots from one video, not 10 unrelated photos.',
        'Describe only what is visible or strongly implied by the sequence.',
        'Keep the wording simple, concrete, and suitable for a first-year class demo.',
        'Do not mention diagnoses.',
        'Return exactly one scene description for each frame in order.',
      ].join(' '),
    },
    ...frames.flatMap((frame) => [
      {
        type: 'text',
        text: `Frame ${frame.index} appears around ${Math.max(
          0,
          Math.round(frame.timeMs / 100) / 10
        )} seconds in the original video.`,
      },
      {
        type: 'image_url',
        image_url: {
          url: `data:${frame.mimeType};base64,${frame.base64}`,
        },
      },
    ]),
  ];

  const payload = await callOpenRouter<SceneDescriptionResponse>({
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: 'user',
        content: userContent,
      },
    ],
    temperature: 0.2,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'scene_descriptions',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            scenes: {
              type: 'array',
              minItems: DEFAULT_FRAME_COUNT,
              maxItems: DEFAULT_FRAME_COUNT,
              items: {
                type: 'object',
                properties: {
                  index: {
                    type: 'integer',
                    description: 'Frame number from 1 to 10.',
                  },
                  description: {
                    type: 'string',
                    description:
                      'One or two plain sentences describing the visible scene and action for that frame.',
                  },
                },
                required: ['index', 'description'],
                additionalProperties: false,
              },
            },
          },
          required: ['scenes'],
          additionalProperties: false,
        },
      },
    },
  });

  return frames.map<SceneDescription>((frame, index) => ({
    index: frame.index,
    timeMs: frame.timeMs,
    description:
      payload.scenes.find((scene) => scene.index === frame.index)?.description?.trim() ||
      payload.scenes[index]?.description?.trim() ||
      'Scene description unavailable for this frame.',
  }));
}

async function reasonOverScenes(
  patient: PatientProfile,
  clipLabel: string,
  sceneDescriptions: SceneDescription[],
  onStageChange: StageReporter
) {
  onStageChange(
    'reasoning',
    'Combining scene descriptions, patient data, and guided demo context through OpenRouter.'
  );

  const patientSummary = {
    name: patient.name,
    age: patient.age,
    sex: patient.sex,
    caregiverName: patient.caregiverName,
    focusNote: patient.focusNote,
    commonRoutines: patient.commonRoutines,
    knownRiskAreas: patient.knownRiskAreas,
    reminderPreferences: patient.reminderPreferences,
    communicationPreferences: patient.communicationPreferences,
    interpretationNotes: patient.interpretationNotes,
    supportTags: patient.supportTags,
  };

  const orderedScenes = sceneDescriptions
    .map(
      (scene) =>
        `Frame ${scene.index} at about ${Math.max(0, Math.round(scene.timeMs / 100) / 10)}s: ${scene.description}`
    )
    .join('\n');

  return callOpenRouter<ReasonedAnalysis>({
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: 'system',
        content: [
          'You are the reasoning step for a first-year course demo about supportive cognitive decline monitoring.',
          'Your output will be rendered in a polished card layout, so every field must be concise, calm, and caregiver-friendly.',
          'Stay supportive and practical. Do not give a diagnosis or claim certainty beyond the evidence.',
          'Focus on distraction, unfinished sink-related steps, and water safety concerns when supported by the scene descriptions and context.',
        ].join(' '),
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              'Create a structured caregiver-facing analysis in the exact JSON format requested.',
              'Write each field so it reads well as a labeled section in the UI.',
              'Formatting rules:',
              '- observedSummary: one short sentence for the analysis list.',
              '- category: 2 to 4 words.',
              '- status: 2 to 4 words.',
              '- observedActivity: 2 to 4 sentences describing what happened in order.',
              '- systemInterpretation: 2 to 3 sentences explaining why the event matters for this patient.',
              '- suggestedReminder: 1 to 2 calm sentences with a clear next step.',
              '- reminderEnabled: true only when a reminder is clearly helpful.',
              '- reminderType: choose the best matching option from the enum.',
              `Clip label: ${clipLabel}`,
              `Demo context:\n${demoAnalysisContext}`,
              `Patient profile:\n${JSON.stringify(patientSummary, null, 2)}`,
              `Scene descriptions:\n${orderedScenes}`,
            ].join('\n\n'),
          },
        ],
      },
    ],
    temperature: 0.3,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'caregiver_analysis',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            observedSummary: {
              type: 'string',
              description: 'A short summary for the analysis list screen.',
            },
            category: {
              type: 'string',
              description: 'A short category such as Incomplete task, Water safety, or Routine support.',
            },
            status: {
              type: 'string',
              description: 'A short caregiver-facing status label.',
            },
            observedActivity: {
              type: 'string',
              description: 'A brief ordered description of what happened across the clip.',
            },
            systemInterpretation: {
              type: 'string',
              description: 'A short interpretation connected to the patient profile and guided context.',
            },
            suggestedReminder: {
              type: 'string',
              description: 'A calm reminder or caregiver follow-up suggestion.',
            },
            reminderEnabled: {
              type: 'boolean',
              description: 'True when the clip suggests a reminder would likely help.',
            },
            reminderType: {
              type: 'string',
              enum: [
                'follow-up reminder',
                'recurring reminder',
                'task-specific reminder',
                'caregiver notification',
                'low-priority note',
              ],
              description: 'The most suitable reminder style for this demo.',
            },
          },
          required: [
            'observedSummary',
            'category',
            'status',
            'observedActivity',
            'systemInterpretation',
            'suggestedReminder',
            'reminderEnabled',
            'reminderType',
          ],
          additionalProperties: false,
        },
      },
    },
  });
}

export async function analyzeClipWithOpenRouter(
  patient: PatientProfile,
  asset: ImagePickerAsset,
  clipLabel: string,
  onStageChange: StageReporter
) {
  const frames = await extractFramesFromVideo(asset, onStageChange);
  const sceneDescriptions = await describeScenes(frames, onStageChange);
  const reasonedAnalysis = await reasonOverScenes(patient, clipLabel, sceneDescriptions, onStageChange);

  return {
    sceneDescriptions,
    ...reasonedAnalysis,
  };
}
