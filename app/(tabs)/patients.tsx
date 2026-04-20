import { useState } from 'react';
import { useRouter } from 'expo-router';
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
import { patientSupportTags } from '@/constants/care-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/lib/date';
import { useAppState } from '@/providers/app-state';

type PatientFormState = {
  name: string;
  age: string;
  sex: string;
  caregiverName: string;
  emergencyContact: string;
  focusNote: string;
  commonRoutines: string;
  knownRiskAreas: string;
  reminderPreferences: string;
  communicationPreferences: string;
  interpretationNotes: string;
  supportTags: string[];
};

const initialFormState: PatientFormState = {
  name: '',
  age: '',
  sex: '',
  caregiverName: '',
  emergencyContact: '',
  focusNote: '',
  commonRoutines: '',
  knownRiskAreas: '',
  reminderPreferences: '',
  communicationPreferences: '',
  interpretationNotes: '',
  supportTags: [],
};

export default function PatientsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = appColors[colorScheme];
  const router = useRouter();
  const { patients, addPatient, selectPatient } = useAppState();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PatientFormState>(initialFormState);

  const updateField = (field: keyof PatientFormState, value: string | string[]) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const toggleTag = (tag: string) => {
    const exists = form.supportTags.includes(tag);

    updateField(
      'supportTags',
      exists ? form.supportTags.filter((item) => item !== tag) : [...form.supportTags, tag]
    );
  };

  const handleCreatePatient = () => {
    if (!form.name.trim() || !form.age.trim() || !form.sex.trim()) {
      Alert.alert('Missing basics', 'Please add a name, age, and sex for the new patient profile.');
      return;
    }

    const patient = addPatient({
      name: form.name.trim(),
      age: form.age.trim(),
      sex: form.sex.trim(),
      caregiverName: form.caregiverName.trim(),
      emergencyContact: form.emergencyContact.trim(),
      commonRoutines: form.commonRoutines.trim(),
      knownRiskAreas: form.knownRiskAreas.trim(),
      reminderPreferences: form.reminderPreferences.trim(),
      communicationPreferences: form.communicationPreferences.trim(),
      interpretationNotes: form.interpretationNotes.trim(),
      supportTags: form.supportTags,
      focusNote: form.focusNote.trim() || 'General daily routine support',
    });

    setForm(initialFormState);
    setShowForm(false);
    selectPatient(patient.id);

    router.push({
      pathname: '/patient/[id]',
      params: { id: patient.id },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Patients</Text>
        </View>

        <View
          style={[
            styles.createCard,
            {
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.accent,
            },
          ]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Add a new patient</Text>
              <Text style={[styles.cardBody, { color: colors.subtext }]}>
                Make a profile, add the basics, and save the notes you want for later clips.
              </Text>
            </View>

            <Pressable
              onPress={() => setShowForm((currentValue) => !currentValue)}
              style={[styles.secondaryButton, { borderColor: colors.border }]}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                {showForm ? 'Close' : 'New patient'}
              </Text>
            </Pressable>
          </View>

          {showForm ? (
            <View style={styles.form}>
              <TextInput
                placeholder="Name"
                placeholderTextColor={colors.subtext}
                value={form.name}
                onChangeText={(value) => updateField('name', value)}
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
                  placeholder="Age"
                  placeholderTextColor={colors.subtext}
                  value={form.age}
                  onChangeText={(value) => updateField('age', value)}
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
                <TextInput
                  placeholder="Sex"
                  placeholderTextColor={colors.subtext}
                  value={form.sex}
                  onChangeText={(value) => updateField('sex', value)}
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
              </View>
              <TextInput
                placeholder="Caregiver name"
                placeholderTextColor={colors.subtext}
                value={form.caregiverName}
                onChangeText={(value) => updateField('caregiverName', value)}
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
                placeholder="Emergency contact"
                placeholderTextColor={colors.subtext}
                value={form.emergencyContact}
                onChangeText={(value) => updateField('emergencyContact', value)}
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
                placeholder="Short focus note, like medication reminders or kitchen safety focus"
                placeholderTextColor={colors.subtext}
                value={form.focusNote}
                onChangeText={(value) => updateField('focusNote', value)}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />

              <Text style={[styles.formLabel, { color: colors.text }]}>Support tags</Text>
              <View style={styles.tagWrap}>
                {patientSupportTags.map((tag) => {
                  const isSelected = form.supportTags.includes(tag);

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
                      <Text
                        style={[
                          styles.tagText,
                          { color: isSelected ? colors.accent : colors.subtext },
                        ]}>
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                placeholder="Common routines"
                placeholderTextColor={colors.subtext}
                value={form.commonRoutines}
                onChangeText={(value) => updateField('commonRoutines', value)}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />
              <TextInput
                placeholder="Known risk areas"
                placeholderTextColor={colors.subtext}
                value={form.knownRiskAreas}
                onChangeText={(value) => updateField('knownRiskAreas', value)}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />
              <TextInput
                placeholder="Reminder preferences"
                placeholderTextColor={colors.subtext}
                value={form.reminderPreferences}
                onChangeText={(value) => updateField('reminderPreferences', value)}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />
              <TextInput
                placeholder="Communication preferences"
                placeholderTextColor={colors.subtext}
                value={form.communicationPreferences}
                onChangeText={(value) => updateField('communicationPreferences', value)}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />
              <TextInput
                placeholder="Notes for interpretation"
                placeholderTextColor={colors.subtext}
                value={form.interpretationNotes}
                onChangeText={(value) => updateField('interpretationNotes', value)}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />

              <Pressable
                onPress={handleCreatePatient}
                style={[styles.primaryButton, { backgroundColor: colors.accent }]}>
                <Text style={styles.primaryButtonText}>Create patient profile</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.text }]}>Saved patients</Text>
        </View>

        {patients.map((patient) => (
          <Pressable
            key={patient.id}
            onPress={() =>
              router.push({
                pathname: '/patient/[id]',
                params: { id: patient.id },
              })
            }
            style={[
              styles.patientCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.patientCardTop}>
              <View style={styles.patientCardText}>
                <Text style={[styles.patientName, { color: colors.text }]}>{patient.name}</Text>
                <Text style={[styles.patientMeta, { color: colors.subtext }]}>
                  {patient.age} years old, {patient.sex}
                </Text>
              </View>
              <Text style={[styles.lastAnalysis, { color: colors.subtext }]}>
                {formatDate(patient.lastAnalysisAt)}
              </Text>
            </View>

            <Text style={[styles.focusNote, { color: colors.text }]}>{patient.focusNote}</Text>
            <Text style={[styles.cardBody, { color: colors.subtext }]}>
              {patient.supportTags.slice(0, 3).join(' - ') || 'General support profile'}
            </Text>
          </Pressable>
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
  createCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  form: {
    marginTop: 18,
    gap: 12,
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
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
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
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  listHeader: {
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  patientCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  patientCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  patientCardText: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
  },
  patientMeta: {
    marginTop: 5,
    fontSize: 13,
  },
  lastAnalysis: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
    maxWidth: 96,
  },
  focusNote: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
});
