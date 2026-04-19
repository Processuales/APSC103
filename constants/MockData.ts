export const summaryCards = [
  {
    label: 'Flagged events',
    value: '03',
    note: 'from today',
  },
  {
    label: 'Reviewed clips',
    value: '08',
    note: 'last 24 hours',
  },
];

export const recentItems = [
  {
    patient: 'Patient A',
    tag: 'Kitchen safety',
    time: '9:42 AM',
    note: 'Kettle remained active with no follow-up action detected.',
  },
  {
    patient: 'Patient B',
    tag: 'Medication routine',
    time: '8:15 AM',
    note: 'Medication visible, but no clear completion step was observed.',
  },
  {
    patient: 'Patient C',
    tag: 'Task completion',
    time: 'Yesterday',
    note: 'Drawer left open after meal preparation sequence.',
  },
];

export const trendCards = [
  {
    label: 'Repeated kitchen flags',
    value: '4',
    tone: 'warning',
  },
  {
    label: 'Medication reminders',
    value: '2',
    tone: 'success',
  },
];

export const timeline = [
  {
    day: 'Today',
    entries: [
      'Patient A: kettle left active without clear completion step.',
      'Patient B: medication visible during routine check.',
    ],
  },
  {
    day: 'Yesterday',
    entries: [
      'Patient C: meal preparation stopped before cleanup.',
      'Patient A: drawer left open after kitchen movement.',
    ],
  },
];
