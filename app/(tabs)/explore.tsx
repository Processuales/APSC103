import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appColors } from '@/constants/app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { trendCards, timeline } from '@/constants/MockData';

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = appColors[colorScheme];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}>
        <View style={styles.header}>
          <Text style={[styles.overline, { color: colors.accent }]}>Monitoring</Text>
          <Text style={[styles.title, { color: colors.text }]}>History & Trends</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            A simple timeline view for reviewing repeated reminders and possible behavior changes.
          </Text>
        </View>

        <View style={styles.filterRow}>
          <View style={[styles.filterChipActive, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.filterChipActiveText, { color: colors.accent }]}>7 days</Text>
          </View>
          <View style={[styles.filterChip, { borderColor: colors.border }]}>
            <Text style={[styles.filterChipText, { color: colors.subtext }]}>30 days</Text>
          </View>
          <View style={[styles.filterChip, { borderColor: colors.border }]}>
            <Text style={[styles.filterChipText, { color: colors.subtext }]}>All time</Text>
          </View>
        </View>

        <View style={styles.trendRow}>
          {trendCards.map((item) => {
            const toneColor = item.tone === 'warning' ? colors.warning : colors.success;

            return (
              <View
                key={item.label}
                style={[
                  styles.trendCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={[styles.trendLabel, { color: colors.subtext }]}>{item.label}</Text>
                <Text style={[styles.trendValue, { color: colors.text }]}>{item.value}</Text>
                <Text style={[styles.trendFootnote, { color: toneColor }]}>last 7 days</Text>
              </View>
            );
          })}
        </View>

        <View
          style={[
            styles.patternCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Pattern summary</Text>
          <Text style={[styles.patternText, { color: colors.subtext }]}>
            The recent entries suggest that kitchen-related task completion should be monitored more
            closely for Patient A.
          </Text>
        </View>

        {timeline.map((group) => (
          <View key={group.day} style={styles.timelineGroup}>
            <Text style={[styles.timelineHeading, { color: colors.text }]}>{group.day}</Text>

            {group.entries.map((entry) => (
              <View
                key={entry}
                style={[
                  styles.timelineCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                <Text style={[styles.timelineText, { color: colors.subtext }]}>{entry}</Text>
              </View>
            ))}
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
    marginBottom: 18,
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  filterChipActive: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  filterChipActiveText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  trendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
  },
  trendCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  trendLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  trendValue: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  trendFootnote: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
  },
  patternCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  patternText: {
    fontSize: 14,
    lineHeight: 21,
  },
  timelineGroup: {
    marginBottom: 18,
  },
  timelineHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  timelineCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 7,
    marginRight: 10,
  },
  timelineText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
});