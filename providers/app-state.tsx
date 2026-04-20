import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImagePickerAsset } from 'expo-image-picker';
import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  type AnalysisRecord,
  type PatientProfile,
  type ReminderType,
  seedAnalyses,
  seedPatients,
} from '@/constants/care-data';

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
  isReady: boolean;
  addPatient: (input: CreatePatientInput) => PatientProfile;
  updatePatient: (patientId: string, updates: UpdatePatientInput) => void;
  updateAnalysis: (analysisId: string, updates: UpdateAnalysisInput) => void;
  addAnalysisFromClip: (patientId: string, asset: ImagePickerAsset) => AnalysisRecord;
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

function buildAnalysisFromClip(patient: PatientProfile, asset: ImagePickerAsset): AnalysisRecord {
  const clipLabel = extractClipLabel(asset);
  const combinedContext = `${patient.focusNote} ${patient.knownRiskAreas} ${patient.supportTags.join(' ')}`.toLowerCase();

  let category = 'Routine support';
  let status = 'Review ready';
  let observedSummary = 'Clip uploaded and queued for caregiver review.';
  let observedActivity = `The uploaded clip "${clipLabel}" has been saved for ${patient.name}.`;
  let systemInterpretation =
    'This placeholder entry keeps the clip tied to the patient profile until video analysis is added.';
  let suggestedReminder = 'No reminder has been suggested yet.';
  let reminderType: ReminderType = 'low-priority note';

  if (combinedContext.includes('kitchen') || combinedContext.includes('meal')) {
    category = 'Incomplete task';
    status = 'Reminder suggested';
    observedSummary = 'Kitchen-related activity was uploaded for follow-up review.';
    observedActivity = `The clip "${clipLabel}" may be relevant to kitchen or meal-prep routines.`;
    systemInterpretation =
      'Based on the patient profile, this clip should be reviewed for unfinished task patterns rather than treated as a medical alert.';
    suggestedReminder = 'Check whether a short kitchen follow-up reminder would help if this happens again.';
    reminderType = 'follow-up reminder';
  } else if (combinedContext.includes('medication')) {
    category = 'Routine support';
    status = 'Review needed';
    observedSummary = 'Medication-related routine clip uploaded for review.';
    observedActivity = `The clip "${clipLabel}" is now associated with the patient’s medication routine.`;
    systemInterpretation =
      'Medication context was detected from the patient profile. A caregiver can later decide whether a reminder would be helpful.';
    suggestedReminder = 'Consider a task-specific morning reminder if repeated missed steps appear.';
    reminderType = 'task-specific reminder';
  } else if (combinedContext.includes('evening')) {
    category = 'Pattern watch';
    status = 'Support option available';
    observedSummary = 'Routine clip uploaded for evening-pattern tracking.';
    observedActivity = `The clip "${clipLabel}" has been added to the patient’s routine history.`;
    systemInterpretation =
      'This entry is best treated as a supportive note for future pattern review, especially around evening routines.';
    suggestedReminder = 'Add a recurring evening reminder only if similar clips continue to appear.';
    reminderType = 'recurring reminder';
  }

  return {
    id: createId('analysis'),
    patientId: patient.id,
    clipLabel,
    clipUri: asset.uri,
    observedSummary,
    category,
    status,
    createdAt: new Date().toISOString(),
    observedActivity,
    systemInterpretation,
    suggestedReminder,
    caregiverNotes: '',
    reminderEnabled: status === 'Reminder suggested',
    reminderType,
  };
}

export function AppStateProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState<StoredState>(initialState);
  const [isReady, setIsReady] = useState(false);

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

        setState({
          patients: parsed.patients,
          analyses: parsed.analyses ?? [],
          selectedPatientId: parsed.selectedPatientId ?? parsed.patients[0]?.id ?? null,
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

  const updateAnalysis = (analysisId: string, updates: UpdateAnalysisInput) => {
    setState((currentState) => ({
      ...currentState,
      analyses: currentState.analyses.map((analysis) =>
        analysis.id === analysisId ? { ...analysis, ...updates } : analysis
      ),
    }));
  };

  const addAnalysisFromClip = (patientId: string, asset: ImagePickerAsset) => {
    const patient = state.patients.find((item) => item.id === patientId);

    if (!patient) {
      throw new Error('Patient not found');
    }

    const newAnalysis = buildAnalysisFromClip(patient, asset);

    setState((currentState) => ({
      ...currentState,
      selectedPatientId: patientId,
      analyses: [newAnalysis, ...currentState.analyses],
      patients: currentState.patients.map((item) =>
        item.id === patientId ? { ...item, lastAnalysisAt: newAnalysis.createdAt } : item
      ),
    }));

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
        isReady,
        addPatient,
        updatePatient,
        updateAnalysis,
        addAnalysisFromClip,
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
