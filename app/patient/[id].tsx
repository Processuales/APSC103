import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appColors } from '@/constants/app-theme';
import { patientSexOptions, patientSupportTags } from '@/constants/care-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/lib/date';
import { useAppState } from '@/providers/app-state';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = Array.isArray(id) ? id[0] : id;
  const colorScheme = useColorScheme() ?? 'light';
  const colors = appColors[colorScheme];
  const { patients, updatePatient, analyses, selectPatient } = useAppState();
  const patient = patients.find((item) => item.id === patientId);
  const patientAnalyses = analyses.filter((analysis) => analysis.patientId === patientId);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [caregiverName, setCaregiverName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [commonRoutines, setCommonRoutines] = useState('');
  const [knownRiskAreas, setKnownRiskAreas] = useState('');
  const [reminderPreferences, setReminderPreferences] = useState('');
  const [communicationPreferences, setCommunicationPreferences] = useState('');
  const [interpretationNotes, setInterpretationNotes] = useState('');
  const [focusNote, setFocusNote] = useState('');
  const [supportTags, setSupportTags] = useState<string[]>([]);

  useEffect(() => {
    if (!patient) {
      return;
    }

    setName(patient.name);
    setAge(patient.age);
    setSex(patient.sex);
    setCaregiverName(patient.caregiverName);
    setEmergencyContact(patient.emergencyContact);
    setCommonRoutines(patient.commonRoutines);
    setKnownRiskAreas(patient.knownRiskAreas);
    setReminderPreferences(patient.reminderPreferences);
    setCommunicationPreferences(patient.communicationPreferences);
    setInterpretationNotes(patient.interpretationNotes);
    setFocusNote(patient.focusNote);
    setSupportTags(patient.supportTags);
  }, [patient]);

  if (!patient) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.missingState}>
          <Text style={[styles.missingTitle, { color: colors.text }]}>Patient not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleTag = (tag: string) => {
    setSupportTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((item) => item !== tag)
        : [...currentTags, tag]
    );
  };

  const handleSave = () => {
    updatePatient(patient.id, {
      name: name.trim(),
      age: age.trim(),
      sex: sex.trim(),
      caregiverName: caregiverName.trim(),
      emergencyContact: emergencyContact.trim(),
      commonRoutines: commonRoutines.trim(),
      knownRiskAreas: knownRiskAreas.trim(),
      reminderPreferences: reminderPreferences.trim(),
      communicationPreferences: communicationPreferences.trim(),
      interpretationNotes: interpretationNotes.trim(),
      focusNote: focusNote.trim() || 'General daily routine support',
      supportTags,
    });
    selectPatient(patient.id);
    Alert.alert('Profile saved', 'The patient context has been updated for future analyses.');
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
          <Text style={[styles.name, { color: colors.text }]}>{patient.name}</Text>
          <Text style={[styles.summaryText, { color: colors.subtext }]}>
            {patient.age} years old, {patient.sex}
          </Text>
          <Text style={[styles.summaryText, { color: colors.subtext }]}>
            Last analysis: {formatDate(patient.lastAnalysisAt)}
          </Text>
          <Text style={[styles.summaryText, { color: colors.subtext }]}>
            {patientAnalyses.length} saved analyses
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic information</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.subtext}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <View style={styles.inlineInputs}>
            <TextInput
              value={age}
              onChangeText={(value) => setAge(value.replace(/[^0-9]/g, ''))}
              placeholder="Age"
              placeholderTextColor={colors.subtext}
              keyboardType="number-pad"
              style={[
                styles.input,
                styles.inlineInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
            <View style={styles.inlineInput}>
              <Text style={[styles.supportLabel, { color: colors.text }]}>Sex</Text>
              <View style={styles.optionWrap}>
                {patientSexOptions.map((option) => {
                  const isSelected = sex === option;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => setSex(option)}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: isSelected ? colors.accentSoft : colors.background,
                          borderColor: isSelected ? colors.accent : colors.border,
                        },
                      ]}>
                      <Text style={[styles.optionText, { color: isSelected ? colors.accent : colors.subtext }]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
          <TextInput
            value={caregiverName}
            onChangeText={setCaregiverName}
            placeholder="Caregiver name"
            placeholderTextColor={colors.subtext}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            placeholder="Emergency contact"
            placeholderTextColor={colors.subtext}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        </View>

        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Context for future analysis</Text>
          <TextInput
            value={focusNote}
            onChangeText={setFocusNote}
            placeholder="Short focus note"
            placeholderTextColor={colors.subtext}
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            value={commonRoutines}
            onChangeText={setCommonRoutines}
            placeholder="Common routines"
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            value={knownRiskAreas}
            onChangeText={setKnownRiskAreas}
            placeholder="Known risk areas"
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            value={reminderPreferences}
            onChangeText={setReminderPreferences}
            placeholder="Reminder preferences"
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            value={communicationPreferences}
            onChangeText={setCommunicationPreferences}
            placeholder="Communication preferences"
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <TextInput
            value={interpretationNotes}
            onChangeText={setInterpretationNotes}
            placeholder="Notes for interpretation"
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />

          <Text style={[styles.supportLabel, { color: colors.text }]}>Support tags</Text>
          <View style={styles.tagWrap}>
            {patientSupportTags.map((tag) => {
              const isSelected = supportTags.includes(tag);

              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: isSelected ? colors.accentSoft : colors.background,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}>
                  <Text style={[styles.tagText, { color: isSelected ? colors.accent : colors.subtext }]}>
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.accent }]}>
          <Text style={styles.saveButtonText}>Save profile</Text>
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
  name: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  summaryText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineInput: {
    flex: 1,
  },
  textArea: {
    minHeight: 100,
  },
  supportLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
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
