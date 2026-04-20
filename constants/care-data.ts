export type ReminderType =
  | 'follow-up reminder'
  | 'recurring reminder'
  | 'task-specific reminder'
  | 'caregiver notification'
  | 'low-priority note';

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

export const seedPatients: PatientProfile[] = [
  {
    id: 'patient-a',
    name: 'Margaret Lee',
    age: '76',
    sex: 'Female',
    caregiverName: 'Daniel Lee',
    emergencyContact: 'Daniel Lee, 555-0118',
    commonRoutines: 'Usually takes medication at 8 AM and has tea after breakfast.',
    knownRiskAreas: 'Can leave kitchen tasks unfinished when distracted.',
    reminderPreferences: 'Short morning reminders and one follow-up if a routine is missed.',
    communicationPreferences: 'Prefers calm, direct reminders with one task at a time.',
    interpretationNotes: 'Caregiver wants alerts for repeated incomplete kitchen steps.',
    supportTags: ['Medication routine', 'Kitchen safety', 'Short reminders'],
    focusNote: 'Medication reminders and kitchen safety focus',
    lastAnalysisAt: '2026-04-19T09:42:00.000Z',
  },
  {
    id: 'patient-b',
    name: 'Samuel Ortiz',
    age: '81',
    sex: 'Male',
    caregiverName: 'Alicia Ortiz',
    emergencyContact: 'Alicia Ortiz, 555-0144',
    commonRoutines: 'Checks medication organizer after breakfast and prepares lunch at noon.',
    knownRiskAreas: 'May pause meal prep and forget cleanup or stove follow-up.',
    reminderPreferences: 'Likes reminders tied to task steps instead of long messages.',
    communicationPreferences: 'Prefers brief reminders with reassurance.',
    interpretationNotes: 'Caregiver wants patterns logged before adding new reminders.',
    supportTags: ['Meal preparation', 'Kitchen safety', 'Gentle prompts'],
    focusNote: 'Kitchen follow-up and meal-prep completion',
    lastAnalysisAt: '2026-04-18T12:15:00.000Z',
  },
  {
    id: 'patient-c',
    name: 'Irene Park',
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
    clipLabel: 'Kitchen clip',
    clipUri: 'local://kitchen-clip',
    observedSummary: 'Kettle visible, no follow-up action detected.',
    category: 'Incomplete task',
    status: 'Reminder suggested',
    createdAt: '2026-04-19T09:42:00.000Z',
    observedActivity: 'The clip showed Margaret moving away from the kettle after it was active.',
    systemInterpretation:
      'This looks like an unfinished kitchen step. A follow-up reminder may help if the pattern repeats.',
    suggestedReminder: 'Check in if a kitchen task appears unfinished after a short delay.',
    caregiverNotes: '',
    reminderEnabled: true,
    reminderType: 'follow-up reminder',
  },
  {
    id: 'analysis-2',
    patientId: 'patient-b',
    clipLabel: 'Morning medication',
    clipUri: 'local://medication-clip',
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
  },
  {
    id: 'analysis-3',
    patientId: 'patient-b',
    clipLabel: 'Lunch preparation',
    clipUri: 'local://lunch-clip',
    observedSummary: 'Meal-prep activity stopped before cleanup was visible.',
    category: 'Incomplete task',
    status: 'Reminder suggested',
    createdAt: '2026-04-17T12:05:00.000Z',
    observedActivity: 'Samuel moved away from the counter mid-task and cleanup was not visible.',
    systemInterpretation:
      'This pattern may benefit from a task-specific prompt rather than a broad alert.',
    suggestedReminder: 'Add a low-pressure kitchen cleanup reminder after lunch prep.',
    caregiverNotes: '',
    reminderEnabled: true,
    reminderType: 'task-specific reminder',
  },
];
