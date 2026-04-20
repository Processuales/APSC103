import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appColors } from '@/constants/app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useClipUpload } from '@/hooks/use-clip-upload';
import { useAppState } from '@/providers/app-state';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = appColors[colorScheme];
  const { patients, analyses, selectedPatientId, selectPatient } = useAppState();
  const { pickClip } = useClipUpload();

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? patients[0];
  const reminderCount = analyses.filter(
    (analysis) =>
      analysis.reminderEnabled ||
      analysis.status === 'Reminder suggested' ||
      analysis.status === 'Support option available'
  ).length;
  const stats = [
    { label: 'Total patients', value: patients.length.toString().padStart(2, '0') },
    { label: 'Clips analyzed', value: analyses.length.toString().padStart(2, '0') },
    { label: 'Reminders pending', value: reminderCount.toString().padStart(2, '0') },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Caregiver Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            Upload clips for patients and keep everything in one place.
          </Text>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Upload a new clip</Text>
          <Text style={[styles.heroText, { color: colors.subtext }]}>
            Choose the patient first so every upload lands in the right profile and analysis
            history.
          </Text>

          <Text style={[styles.sectionLabel, { color: colors.text }]}>Selected patient</Text>
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
                  <Text
                    style={[
                      styles.patientChipText,
                      { color: isActive ? colors.accent : colors.subtext },
                    ]}>
                    {patient.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => pickClip(selectedPatient?.id)}
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}>
            <Text style={styles.primaryButtonText}>Upload Clip</Text>
          </Pressable>

          {selectedPatient ? (
            <Text style={[styles.helperText, { color: colors.subtext }]}>
              Uploads will be saved under {selectedPatient.name}.
            </Text>
          ) : (
            <Text style={[styles.helperText, { color: colors.subtext }]}>
              Create a patient profile before uploading a clip.
            </Text>
          )}
        </View>

        <View
          style={[
            styles.overviewCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.statRow}>
            {stats.map((item) => (
              <View key={item.label} style={styles.statBlock}>
                <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
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
    maxWidth: 280,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 6,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 290,
  },
  sectionLabel: {
    marginTop: 18,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  chipRow: {
    gap: 10,
    paddingTop: 12,
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
  primaryButton: {
    marginTop: 18,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  overviewCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statBlock: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
  },
  statLabel: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
