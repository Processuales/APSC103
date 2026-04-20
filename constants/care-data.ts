export type ReminderType =
  | 'follow-up reminder'
  | 'recurring reminder'
  | 'task-specific reminder'
  | 'caregiver notification'
  | 'low-priority note';

export type AnalysisStage = 'extracting' | 'describing' | 'reasoning' | 'complete' | 'failed';

export type SceneDescription = {
  index: number;
  timeMs: number;
  description: string;
};

export type PatientProfile = {
  id: string;
  name: string;
  age: string;
  sex: string;
  caregiverName: string;
  emergencyContact: string;
  commonRoutines: string;
  knownRiskAreas: string;
  reminderPreferences: string;
  communicationPreferences: string;
  interpretationNotes: string;
  supportTags: string[];
  focusNote: string;
  lastAnalysisAt: string | null;
};

export type AnalysisRecord = {
  id: string;
  patientId: string;
  clipLabel: string;
  clipUri: string;
  clipDurationMs: number | null;
  observedSummary: string;
  category: string;
  status: string;
  createdAt: string;
  observedActivity: string;
  systemInterpretation: string;
  suggestedReminder: string;
  caregiverNotes: string;
  reminderEnabled: boolean;
  reminderType: ReminderType;
  processingStage: AnalysisStage;
  processingMessage: string;
  sceneDescriptions: SceneDescription[];
};

export const patientSupportTags = [
  'Medication routine',
  'Kitchen safety',
  'Meal preparation',
  'Short reminders',
  'Evening confusion',
  'Wandering watch',
  'Fall awareness',
  'Appointment prep',
  'Gentle prompts',
] as const;

export const patientSexOptions = ['Male', 'Female', 'Other'] as const;

export const defaultPatientNamesById: Record<string, string> = {
  'patient-a': 'Emmett Brown',
  'patient-b': 'James Kirk',
  'patient-c': 'David Bowman',
};

export const seedPatients: PatientProfile[] = [
  {
    id: 'patient-a',
    name: 'Emmett Brown',
    age: '76',
    sex: 'Female',
    caregiverName: 'Daniel Lee',
    emergencyContact: 'Daniel Lee, 555-0118',
    commonRoutines: 'Usually washes dishes after breakfast and wipes down the sink area.',
    knownRiskAreas: 'Can leave sink-related tasks unfinished when distracted.',
    reminderPreferences: 'Short morning reminders and one follow-up if a routine is missed.',
    communicationPreferences: 'Prefers calm, direct reminders with one task at a time.',
    interpretationNotes: 'Caregiver wants alerts for repeated incomplete sink or water-related steps.',
    supportTags: ['Kitchen safety', 'Short reminders', 'Gentle prompts'],
    focusNote: 'Sink safety and unfinished kitchen-step focus',
    lastAnalysisAt: '2026-04-19T09:42:00.000Z',
  },
  {
    id: 'patient-b',
    name: 'James Kirk',
    age: '81',
    sex: 'Male',
    caregiverName: 'Alicia Ortiz',
    emergencyContact: 'Alicia Ortiz, 555-0144',
    commonRoutines: 'Prepares lunch at noon and rinses dishes in the sink after meals.',
    knownRiskAreas: 'May pause cleanup and forget running water or sink follow-up.',
    reminderPreferences: 'Likes reminders tied to task steps instead of long messages.',
    communicationPreferences: 'Prefers brief reminders with reassurance.',
    interpretationNotes: 'Caregiver wants patterns logged before adding new reminders for sink safety.',
    supportTags: ['Meal preparation', 'Kitchen safety', 'Gentle prompts'],
    focusNote: 'Sink follow-up and meal cleanup completion',
    lastAnalysisAt: '2026-04-18T12:15:00.000Z',
  },
  {
    id: 'patient-c',
    name: 'David Bowman',
    age: '72',
    sex: 'Female',
    caregiverName: 'Nina Park',
    emergencyContact: 'Nina Park, 555-0176',
    commonRoutines: 'Morning walk, medication check, and evening hydration reminder.',
    knownRiskAreas: 'Occasionally misses the second step of evening routines.',
    reminderPreferences: 'Prefers recurring reminders in the evening only.',
    communicationPreferences: 'Responds well to warm reminders with simple wording.',
    interpretationNotes: 'Flag repeated missed steps, especially during evening routines.',
    supportTags: ['Evening confusion', 'Gentle prompts'],
    focusNote: 'Evening routine support and missed-step tracking',
    lastAnalysisAt: null,
  },
];

export const seedAnalyses: AnalysisRecord[] = [
  {
    id: 'analysis-1',
    patientId: 'patient-a',
    clipLabel: 'Kitchen sink clip',
    clipUri: 'local://kitchen-sink-clip',
    clipDurationMs: 18000,
    observedSummary: 'Sink left running while attention moved elsewhere.',
    category: 'Incomplete task',
    status: 'Reminder suggested',
    createdAt: '2026-04-19T09:42:00.000Z',
    observedActivity: 'The clip showed Margaret turning on the sink and then moving away before the water was turned off.',
    systemInterpretation:
      'This looks like an unfinished sink-related step. A follow-up reminder may help if the pattern repeats.',
    suggestedReminder: 'Check in if sink water appears to be left running after the patient steps away.',
    caregiverNotes: '',
    reminderEnabled: true,
    reminderType: 'follow-up reminder',
    processingStage: 'complete',
    processingMessage: 'Analysis ready.',
    sceneDescriptions: [
      {
        index: 1,
        timeMs: 900,
        description: 'Margaret stands at the sink and appears to begin washing or rinsing something.',
      },
      {
        index: 2,
        timeMs: 2600,
        description: 'Water is running at the sink while Margaret remains nearby for a moment.',
      },
      {
        index: 3,
        timeMs: 4400,
        description: 'Margaret turns away from the sink area and looks toward another part of the room.',
      },
    ],
  },
  {
    id: 'analysis-2',
    patientId: 'patient-b',
    clipLabel: 'Morning medication',
    clipUri: 'local://medication-clip',
    clipDurationMs: 12000,
    observedSummary: 'Medication organizer visible with no clear completion step.',
    category: 'Routine support',
    status: 'Review needed',
    createdAt: '2026-04-18T08:15:00.000Z',
    observedActivity: 'The clip captured the medication organizer during the morning routine.',
    systemInterpretation:
      'The routine may have paused before completion. Logging a reminder could support consistency.',
    suggestedReminder: 'Offer a short morning follow-up if the organizer is left open.',
    caregiverNotes: '',
    reminderEnabled: false,
    reminderType: 'task-specific reminder',
    processingStage: 'complete',
    processingMessage: 'Analysis ready.',
    sceneDescriptions: [
      {
        index: 1,
        timeMs: 1100,
        description: 'Samuel is near a table with a medication organizer in view.',
      },
      {
        index: 2,
        timeMs: 5200,
        description: 'The organizer remains open while the routine appears to pause.',
      },
    ],
  },
  {
    id: 'analysis-3',
    patientId: 'patient-b',
    clipLabel: 'Lunch cleanup',
    clipUri: 'local://lunch-cleanup-clip',
    clipDurationMs: 22000,
    observedSummary: 'Cleanup activity stopped before the sink task looked complete.',
    category: 'Incomplete task',
    status: 'Reminder suggested',
    createdAt: '2026-04-17T12:05:00.000Z',
    observedActivity: 'Samuel moved away from the sink mid-task and cleanup did not appear complete.',
    systemInterpretation:
      'This pattern may benefit from a task-specific prompt rather than a broad alert.',
    suggestedReminder: 'Add a low-pressure sink cleanup reminder after lunch.',
    caregiverNotes: '',
    reminderEnabled: true,
    reminderType: 'task-specific reminder',
    processingStage: 'complete',
    processingMessage: 'Analysis ready.',
    sceneDescriptions: [
      {
        index: 1,
        timeMs: 1400,
        description: 'Samuel is at the sink after a meal with dishes and cleanup items nearby.',
      },
      {
        index: 2,
        timeMs: 7100,
        description: 'Cleanup continues for a short time, but the sink area still looks busy and unfinished.',
      },
      {
        index: 3,
        timeMs: 15700,
        description: 'Samuel moves away before the sink task or cleanup looks complete.',
      },
    ],
  },
];
