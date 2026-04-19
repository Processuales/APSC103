import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { appColors } from '@/constants/app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = appColors[colorScheme];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>Preview</Text>
        <Text style={[styles.title, { color: colors.text }]}>Detected activity summary</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          This is a UI-only modal showing the kind of short, caregiver-facing summary the app could
          display after analysis.
        </Text>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Observed</Text>
          <Text style={[styles.sectionBody, { color: colors.text }]}>
            Kettle visible on stove. User remained inactive after the object was detected.
          </Text>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>System note</Text>
          <Text style={[styles.sectionBody, { color: colors.text }]}>
            This pattern may indicate an incomplete kitchen task.
          </Text>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Suggested next step</Text>
          <Text style={[styles.sectionBody, { color: colors.text }]}>
            Caregiver may want to verify that the stove is off and the task was completed safely.
          </Text>
        </View>

        <Link href="/" dismissTo asChild>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: colors.accent,
              },
            ]}>
            <Text style={styles.buttonText}>Close preview</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  button: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});