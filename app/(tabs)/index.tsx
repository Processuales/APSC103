import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appColors } from '@/constants/app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { summaryCards, recentItems } from '@/constants/MockData';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = appColors[colorScheme];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}>
        <View style={styles.header}>
          <Text style={[styles.overline, { color: colors.accent }]}>Caregiver App</Text>
          <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            A simple overview of patient activity summaries and recent reminders.
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
          <Text style={[styles.heroLabel, { color: colors.subtext }]}>Today&apos;s overview</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Three events may need caregiver review.
          </Text>
          <Text style={[styles.heroBody, { color: colors.subtext }]}>
            The interface keeps the information short, readable, and non-diagnostic.
          </Text>

          <Link href="/modal" asChild>
            <Pressable
              style={[
                styles.primaryButton,
                {
                  backgroundColor: colors.accent,
                },
              ]}>
              <Text style={styles.primaryButtonText}>Open sample summary</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.summaryRow}>
          {summaryCards.map((item) => (
            <View
              key={item.label}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}>
              <Text style={[styles.summaryLabel, { color: colors.subtext }]}>{item.label}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.summaryNote, { color: colors.subtext }]}>{item.note}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick actions</Text>
        </View>

        <View style={styles.actionRow}>
          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Upload clip</Text>
            <Text style={[styles.actionText, { color: colors.subtext }]}>
              Start a new visual analysis from a prerecorded video.
            </Text>
          </View>

          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Patient profiles</Text>
            <Text style={[styles.actionText, { color: colors.subtext }]}>
              Switch between patients and review their saved history.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent summaries</Text>
          <Text style={[styles.sectionLink, { color: colors.accent }]}>View all</Text>
        </View>

        {recentItems.map((item) => (
          <View
            key={`${item.patient}-${item.time}`}
            style={[
              styles.listCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.listTopRow}>
              <Text style={[styles.patientName, { color: colors.text }]}>{item.patient}</Text>
              <Text style={[styles.listTime, { color: colors.subtext }]}>{item.time}</Text>
            </View>

            <View
              style={[
                styles.tag,
                {
                  backgroundColor: colors.accentSoft,
                },
              ]}>
              <Text style={[styles.tagText, { color: colors.accent }]}>{item.tag}</Text>
            </View>

            <Text style={[styles.listNote, { color: colors.subtext }]}>{item.note}</Text>
          </View>
        ))}
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
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  heroBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    marginTop: 18,
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  summaryNote: {
    marginTop: 6,
    fontSize: 13,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    marginBottom: 20,
  },
  actionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  listCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  listTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
  },
  listTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listNote: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
  },
});