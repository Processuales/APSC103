import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appColors } from '@/constants/app-theme';
import { type AnalysisStage, type ReminderType } from '@/constants/care-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateTime } from '@/lib/date';
import { useAppState } from '@/providers/app-state';

const reminderOptions: ReminderType[] = [
  'follow-up reminder',
  'recurring reminder',
  'task-specific reminder',
  'caregiver notification',
  'low-priority note',
];

const stageOrder: AnalysisStage[] = ['extracting', 'describing', 'reasoning', 'complete'];

function stageLabel(stage: AnalysisStage) {
  switch (stage) {
    case 'extracting':
      return 'Extract frames';
    case 'describing':
      return 'Describe scenes';
    case 'reasoning':
      return 'Reason over context';
    case 'failed':
      return 'Analysis failed';
    case 'complete':
    default:
      return 'Analysis ready';
  }
}

export default function AnalysisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const analysisId = Array.isArray(id) ? id[0] : id;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = appColors[colorScheme];
  const { analyses, patients, updateAnalysis, selectPatient } = useAppState();
  const analysis = analyses.find((item) => item.id === analysisId);
  const patient = patients.find((item) => item.id === analysis?.patientId);
  const sceneDescriptions = analysis?.sceneDescriptions ?? [];
  const [caregiverNotes, setCaregiverNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderType, setReminderType] = useState<ReminderType>('low-priority note');

  useEffect(() => {
    if (!analysis) {
      return;
    }

    setCaregiverNotes(analysis.caregiverNotes);
    setReminderEnabled(analysis.reminderEnabled);
    setReminderType(analysis.reminderType);
  }, [analysis]);

  if (!analysis) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.missingState}>
          <Text style={[styles.missingTitle, { color: colors.text }]}>Analysis not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isComplete = analysis.processingStage === 'complete';
  const isFailed = analysis.processingStage === 'failed';
  const currentStageIndex = stageOrder.indexOf(
    isFailed ? 'reasoning' : analysis.processingStage === 'complete' ? 'complete' : analysis.processingStage
  );

  const handleSave = () => {
    updateAnalysis(analysis.id, {
      caregiverNotes: caregiverNotes.trim(),
      reminderEnabled,
      reminderType,
      status: reminderEnabled ? 'Reminder suggested' : 'Analysis ready',
      suggestedReminder: reminderEnabled
        ? analysis.suggestedReminder
        : 'No reminder is currently enabled for this clip.',
    });

    if (patient) {
      selectPatient(patient.id);
    }

    Alert.alert('Analysis updated', 'Caregiver notes and reminder settings have been saved.');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.clipName, { color: colors.text }]}>{analysis.clipLabel}</Text>
          <Text style={[styles.metaText, { color: colors.subtext }]}>
            {patient?.name ?? 'Unknown patient'}
          </Text>
          <Text style={[styles.metaText, { color: colors.subtext }]}>
            {formatDateTime(analysis.createdAt)}
          </Text>
          <View style={styles.summaryBadgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>{analysis.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.background }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>{analysis.status}</Text>
            </View>
          </View>
        </View>

        {!isComplete ? (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isFailed ? 'Analysis stopped' : 'Processing clip'}
            </Text>
            <Text style={[styles.sectionBody, { color: colors.subtext }]}>
              {analysis.processingMessage}
            </Text>

            <View style={styles.stageList}>
              {stageOrder.map((stage, index) => {
                const isDone = !isFailed && index < currentStageIndex;
                const isActive =
                  (!isFailed && stage === analysis.processingStage) ||
                  (analysis.processingStage === 'complete' && stage === 'complete');

                return (
                  <View
                    key={stage}
                    style={[
                      styles.stageRow,
                      {
                        backgroundColor:
                          isDone || isActive ? colors.accentSoft : colors.background,
                        borderColor: isDone || isActive ? colors.accent : colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.stageLabel,
                        {
                          color: isDone || isActive ? colors.accent : colors.subtext,
                        },
                      ]}>
                      {stageLabel(stage)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text style={[styles.helperText, { color: colors.subtext }]}>
              This demo always samples 10 frames from the video, no matter how long the clip is.
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Scene descriptions</Text>
          {sceneDescriptions.length ? (
            sceneDescriptions.map((scene) => (
              <View
                key={`${scene.index}-${scene.timeMs}`}
                style={[styles.sceneCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.sceneTitle, { color: colors.text }]}>
                  Frame {scene.index} at about {Math.max(0, Math.round(scene.timeMs / 100) / 10)}s
                </Text>
                <Text style={[styles.sceneBody, { color: colors.subtext }]}>{scene.description}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.sectionBody, { color: colors.subtext }]}>
              Scene descriptions will appear here after OpenRouter reads the 10 sampled frames.
            </Text>
          )}
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Observed activity</Text>
          <Text style={[styles.sectionBody, { color: colors.subtext }]}>{analysis.observedActivity}</Text>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>System interpretation</Text>
          <Text style={[styles.sectionBody, { color: colors.subtext }]}>
            {analysis.systemInterpretation}
          </Text>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggested reminder</Text>
          <Text style={[styles.sectionBody, { color: colors.subtext }]}>
            {isComplete
              ? reminderEnabled
                ? analysis.suggestedReminder
                : 'Reminder disabled for now.'
              : 'Reminder options unlock after the reasoning step finishes.'}
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={[styles.switchTitle, { color: colors.text }]}>Enable reminder setup</Text>
            </View>
            <Switch
              disabled={!isComplete}
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: colors.border, true: colors.accent }}
            />
          </View>

          <View style={styles.reminderOptions}>
            {reminderOptions.map((option) => {
              const isSelected = reminderType === option;

              return (
                <Pressable
                  key={option}
                  disabled={!isComplete}
                  onPress={() => setReminderType(option)}
                  style={[
                    styles.reminderChip,
                    {
                      backgroundColor: isSelected ? colors.accentSoft : colors.background,
                      borderColor: isSelected ? colors.accent : colors.border,
                      opacity: isComplete ? 1 : 0.55,
                    },
                  ]}>
                  <Text style={[styles.reminderChipText, { color: isSelected ? colors.accent : colors.subtext }]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Caregiver notes</Text>
          <TextInput
            editable={isComplete}
            value={caregiverNotes}
            onChangeText={setCaregiverNotes}
            placeholder="Add your own note or follow-up plan"
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
                opacity: isComplete ? 1 : 0.55,
              },
            ]}
          />
        </View>

        <Pressable
          disabled={!isComplete}
          onPress={handleSave}
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.accent,
              opacity: isComplete ? 1 : 0.55,
            },
          ]}>
          <Text style={styles.saveButtonText}>{isComplete ? 'Save reminder settings' : 'Waiting for analysis'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 18,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  clipName: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  metaText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
  },
  summaryBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
  },
  stageList: {
    gap: 10,
    marginTop: 18,
  },
  stageRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 20,
  },
  sceneCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  sceneTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  sceneBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  switchRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  switchText: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  reminderChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  reminderChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notesInput: {
    marginTop: 14,
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
  saveButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});
