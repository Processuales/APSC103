import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  defaultPatientNamesById,
  type AnalysisRecord,
  type AnalysisStage,
  type PatientProfile,
  seedAnalyses,
  seedPatients,
} from '@/constants/care-data';
import { analyzeClipWithOpenRouter } from '@/lib/openrouter-analysis';

type StoredState = {
  patients: PatientProfile[];
  analyses: AnalysisRecord[];
  selectedPatientId: string | null;
};

type CreatePatientInput = Omit<PatientProfile, 'id' | 'lastAnalysisAt'>;
type UpdatePatientInput = Partial<Omit<PatientProfile, 'id'>>;
type UpdateAnalysisInput = Partial<Omit<AnalysisRecord, 'id' | 'patientId'>>;

type AppStateContextValue = {
  patients: PatientProfile[];
  analyses: AnalysisRecord[];
  selectedPatientId: string | null;
  activeAnalysisId: string | null;
  isAnalyzingClip: boolean;
  isReady: boolean;
  addPatient: (input: CreatePatientInput) => PatientProfile;
  deletePatient: (patientId: string) => void;
  updatePatient: (patientId: string, updates: UpdatePatientInput) => void;
  deleteAnalysis: (analysisId: string) => void;
  updateAnalysis: (analysisId: string, updates: UpdateAnalysisInput) => void;
  startClipAnalysis: (patientId: string, asset: ImagePickerAsset) => AnalysisRecord;
  selectPatient: (patientId: string) => void;
};

const STORAGE_KEY = 'caregiver-app-state-v1';
const AppStateContext = createContext<AppStateContextValue | null>(null);

const initialState: StoredState = {
  patients: seedPatients,
  analyses: seedAnalyses,
  selectedPatientId: seedPatients[0]?.id ?? null,
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractClipLabel(asset: ImagePickerAsset) {
  if (asset.fileName) {
    return asset.fileName;
  }

  const segments = asset.uri.split('/');
  return segments[segments.length - 1]?.split('?')[0] || 'Uploaded clip';
}

function getStageStatus(stage: AnalysisStage) {
  switch (stage) {
    case 'extracting':
      return 'Extracting frames';
    case 'describing':
      return 'Describing scenes';
    case 'reasoning':
      return 'Reasoning';
    case 'failed':
      return 'Analysis failed';
    case 'complete':
    default:
      return 'Analysis ready';
  }
}

function buildPendingAnalysis(patient: PatientProfile, asset: ImagePickerAsset): AnalysisRecord {
  const clipLabel = extractClipLabel(asset);

  return {
    id: createId('analysis'),
    patientId: patient.id,
    clipLabel,
    clipUri: asset.uri,
    clipDurationMs: asset.duration ?? null,
    observedSummary: 'Sampling 10 frames from the uploaded video for OpenRouter analysis.',
    category: 'AI pipeline',
    status: getStageStatus('extracting'),
    createdAt: new Date().toISOString(),
    observedActivity: `The uploaded video "${clipLabel}" was linked to ${patient.name} and sent to the dual-model OpenRouter workflow.`,
    systemInterpretation:
      'This analysis is still running. The app will first describe 10 sampled frames, then reason over them with the patient profile and demo context.',
    suggestedReminder: 'Reminder suggestions will appear after the reasoning step finishes.',
    caregiverNotes: '',
    reminderEnabled: false,
    reminderType: 'low-priority note',
    processingStage: 'extracting',
    processingMessage: 'Sampling 10 frames from the uploaded video.',
    sceneDescriptions: [],
  };
}

function normalizePatient(patient: PatientProfile): PatientProfile {
  return {
    ...patient,
    name: defaultPatientNamesById[patient.id] ?? patient.name,
    supportTags: patient.supportTags ?? [],
    focusNote: patient.focusNote ?? 'General daily routine support',
    lastAnalysisAt: patient.lastAnalysisAt ?? null,
  };
}

function normalizeAnalysis(analysis: AnalysisRecord): AnalysisRecord {
  return {
    ...analysis,
    clipDurationMs: analysis.clipDurationMs ?? null,
    caregiverNotes: analysis.caregiverNotes ?? '',
    reminderEnabled: analysis.reminderEnabled ?? false,
    reminderType: analysis.reminderType ?? 'low-priority note',
    processingStage: analysis.processingStage ?? 'complete',
    processingMessage: analysis.processingMessage ?? 'Analysis ready.',
    sceneDescriptions: analysis.sceneDescriptions ?? [],
  };
}

function getLatestAnalysisDate(analyses: AnalysisRecord[], patientId: string) {
  const dates = analyses
    .filter((analysis) => analysis.patientId === patientId)
    .map((analysis) => analysis.createdAt)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime());

  return dates[0] ?? null;
}

export function AppStateProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<StoredState>(initialState);
  const [isReady, setIsReady] = useState(false);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedValue) => {
        if (!storedValue || !isMounted) {
          return;
        }

        const parsed = JSON.parse(storedValue) as StoredState;

        if (!parsed.patients?.length) {
          return;
        }

        const normalizedPatients = parsed.patients.map(normalizePatient);
        const normalizedAnalyses = (parsed.analyses ?? []).map(normalizeAnalysis);
        const storedSelectedPatientId = parsed.selectedPatientId ?? normalizedPatients[0]?.id ?? null;
        const selectedPatientId = normalizedPatients.some(
          (patient) => patient.id === storedSelectedPatientId
        )
          ? storedSelectedPatientId
          : normalizedPatients[0]?.id ?? null;

        setState({
          patients: normalizedPatients,
          analyses: normalizedAnalyses,
          selectedPatientId,
        });
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Ignore transient storage errors to keep the app responsive.
    });
  }, [isReady, state]);

  const addPatient = (input: CreatePatientInput) => {
    const newPatient: PatientProfile = {
      ...input,
      id: createId('patient'),
      lastAnalysisAt: null,
    };

    setState((currentState) => ({
      ...currentState,
      patients: [newPatient, ...currentState.patients],
      selectedPatientId: currentState.selectedPatientId ?? newPatient.id,
    }));

    return newPatient;
  };

  const updatePatient = (patientId: string, updates: UpdatePatientInput) => {
    setState((currentState) => ({
      ...currentState,
      patients: currentState.patients.map((patient) =>
        patient.id === patientId ? { ...patient, ...updates } : patient
      ),
    }));
  };

  const deletePatient = (patientId: string) => {
    setState((currentState) => {
      const remainingPatients = currentState.patients.filter((patient) => patient.id !== patientId);
      const remainingAnalyses = currentState.analyses.filter((analysis) => analysis.patientId !== patientId);
      const nextSelectedPatientId =
        currentState.selectedPatientId === patientId
          ? remainingPatients[0]?.id ?? null
          : currentState.selectedPatientId;

      return {
        ...currentState,
        patients: remainingPatients,
        analyses: remainingAnalyses,
        selectedPatientId: nextSelectedPatientId,
      };
    });

    setActiveAnalysisId((currentId) => {
      const removedAnalysis = state.analyses.find(
        (analysis) => analysis.patientId === patientId && analysis.id === currentId
      );

      return removedAnalysis ? null : currentId;
    });
  };

  const updateAnalysis = (analysisId: string, updates: UpdateAnalysisInput) => {
    setState((currentState) => ({
      ...currentState,
      analyses: currentState.analyses.map((analysis) =>
        analysis.id === analysisId ? { ...analysis, ...updates } : analysis
      ),
    }));
  };

  const deleteAnalysis = (analysisId: string) => {
    setState((currentState) => {
      const analysisToDelete = currentState.analyses.find((analysis) => analysis.id === analysisId);

      if (!analysisToDelete) {
        return currentState;
      }

      const remainingAnalyses = currentState.analyses.filter((analysis) => analysis.id !== analysisId);

      return {
        ...currentState,
        analyses: remainingAnalyses,
        patients: currentState.patients.map((patient) =>
          patient.id === analysisToDelete.patientId
            ? {
                ...patient,
                lastAnalysisAt: getLatestAnalysisDate(remainingAnalyses, patient.id),
              }
            : patient
        ),
      };
    });

    setActiveAnalysisId((currentId) => (currentId === analysisId ? null : currentId));
  };

  const runClipAnalysis = async (
    analysisId: string,
    patient: PatientProfile,
    asset: ImagePickerAsset,
    clipLabel: string
  ) => {
    try {
      const updateStage = (stage: Extract<AnalysisStage, 'extracting' | 'describing' | 'reasoning'>, message: string) => {
        updateAnalysis(analysisId, {
          processingStage: stage,
          processingMessage: message,
          status: getStageStatus(stage),
          observedSummary: message,
        });
      };

      const result = await analyzeClipWithOpenRouter(patient, asset, clipLabel, updateStage);

      updateAnalysis(analysisId, {
        ...result,
        processingStage: 'complete',
        processingMessage: 'OpenRouter analysis is ready to review.',
        status: result.status || getStageStatus('complete'),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The analysis pipeline stopped before OpenRouter returned a result.';

      updateAnalysis(analysisId, {
        processingStage: 'failed',
        processingMessage: message,
        status: getStageStatus('failed'),
        observedSummary: 'The upload was saved, but the OpenRouter analysis did not finish.',
        category: 'Needs retry',
        systemInterpretation:
          'The demo kept the clip attached to the patient, but the AI steps did not complete successfully.',
        suggestedReminder: 'No reminder was suggested because the analysis did not finish.',
        reminderEnabled: false,
        reminderType: 'low-priority note',
      });
    } finally {
      setActiveAnalysisId((currentId) => (currentId === analysisId ? null : currentId));
    }
  };

  const startClipAnalysis = (patientId: string, asset: ImagePickerAsset) => {
    const patient = state.patients.find((item) => item.id === patientId);

    if (!patient) {
      throw new Error('Patient not found');
    }

    const newAnalysis = buildPendingAnalysis(patient, asset);

    setState((currentState) => ({
      ...currentState,
      selectedPatientId: patientId,
      analyses: [newAnalysis, ...currentState.analyses],
      patients: currentState.patients.map((item) =>
        item.id === patientId ? { ...item, lastAnalysisAt: newAnalysis.createdAt } : item
      ),
    }));

    setActiveAnalysisId(newAnalysis.id);
    void runClipAnalysis(newAnalysis.id, patient, asset, newAnalysis.clipLabel);

    return newAnalysis;
  };

  const selectPatient = (patientId: string) => {
    setState((currentState) => ({
      ...currentState,
      selectedPatientId: patientId,
    }));
  };

  return (
    <AppStateContext.Provider
      value={{
        patients: state.patients,
        analyses: state.analyses,
        selectedPatientId: state.selectedPatientId,
        activeAnalysisId,
        isAnalyzingClip: activeAnalysisId !== null,
        isReady,
        addPatient,
        deletePatient,
        updatePatient,
        deleteAnalysis,
        updateAnalysis,
        startClipAnalysis,
        selectPatient,
      }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }

  return context;
}
