import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appColors } from '@/constants/app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDateTime, formatRelativeDay } from '@/lib/date';
import { useAppState } from '@/providers/app-state';

export default function AnalysisScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = appColors[colorScheme];
  const router = useRouter();
  const { patients, analyses, deleteAnalysis, selectedPatientId, selectPatient } = useAppState();

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];
  const filteredAnalyses = analyses.filter((analysis) => analysis.patientId === selectedPatient?.id);

  const handleDeleteAnalysis = (analysisId: string, clipLabel: string) => {
    Alert.alert(
      'Delete analysis',
      `Remove the analysis for "${clipLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAnalysis(analysisId),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analysis</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Review uploaded clips and live OpenRouter results
          </Text>
        </View>

        <View
          style={[
            styles.selectorCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Selected patient</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            {patients.map((patient) => {
              const isActive = patient.id === selectedPatient?.id;

              return (
                <Pressable
                  key={patient.id}
                  onPress={() => selectPatient(patient.id)}
                  style={[
                    styles.patientChip,
                    {
                      backgroundColor: isActive ? colors.accentSoft : colors.background,
                      borderColor: isActive ? colors.accent : colors.border,
                    },
                  ]}>
                  <Text style={[styles.patientChipText, { color: isActive ? colors.accent : colors.subtext }]}>
                    {patient.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.timelineHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent analyses</Text>
          <Text style={[styles.timelineCount, { color: colors.subtext }]}>
            {filteredAnalyses.length} records
          </Text>
        </View>

        {filteredAnalyses.length ? (
          filteredAnalyses.map((analysis) => (
            <Swipeable
              key={analysis.id}
              overshootLeft={false}
              renderLeftActions={() => (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleDeleteAnalysis(analysis.id, analysis.clipLabel)}
                  style={[styles.deleteAction, { backgroundColor: colors.danger }]}>
                  <Text style={styles.deleteActionText}>Delete</Text>
                </TouchableOpacity>
              )}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/analysis/[id]',
                    params: { id: analysis.id },
                  })
                }
                style={[
                  styles.analysisCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <View style={styles.analysisTopRow}>
                  <Text style={[styles.analysisDay, { color: colors.accent }]}>
                    {formatRelativeDay(analysis.createdAt)}
                  </Text>
                  <Text style={[styles.analysisTime, { color: colors.subtext }]}>
                    {formatDateTime(analysis.createdAt)}
                  </Text>
                </View>

                <Text style={[styles.analysisTitle, { color: colors.text }]}>{analysis.clipLabel}</Text>
                <Text style={[styles.analysisSummary, { color: colors.subtext }]}>
                  {analysis.processingStage === 'complete'
                    ? analysis.observedSummary
                    : analysis.processingMessage}
                </Text>

                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                    <Text style={[styles.badgeText, { color: colors.accent }]}>
                      Category: {analysis.category}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: colors.background }]}>
                    <Text style={[styles.badgeText, { color: colors.text }]}>
                      Status: {analysis.status}
                    </Text>
                  </View>
                  {analysis.processingStage !== 'complete' ? (
                    <View style={[styles.badge, { backgroundColor: colors.background }]}>
                      <Text style={[styles.badgeText, { color: colors.text }]}>
                        Frames: {analysis.sceneDescriptions?.length ?? 0}/10 described
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            </Swipeable>
          ))
        ) : (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No analyses yet</Text>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              Upload a clip for this patient to create the first analysis entry.
            </Text>
          </View>
        )}
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
  header: {
    gap: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  selectorCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  chipRow: {
    gap: 10,
    paddingTop: 14,
    paddingHorizontal: 4,
  },
  patientChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  patientChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  analysisCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginTop: 12,
  },
  analysisTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  analysisDay: {
    fontSize: 13,
    fontWeight: '700',
  },
  analysisTime: {
    fontSize: 12,
  },
  analysisTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
  },
  analysisSummary: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
  },
  badgeRow: {
    marginTop: 14,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  deleteAction: {
    width: 100,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
