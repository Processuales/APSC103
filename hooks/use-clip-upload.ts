import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { useAppState } from '@/providers/app-state';

export function useClipUpload() {
  const router = useRouter();
  const { addAnalysisFromClip, selectedPatientId } = useAppState();

  const pickClip = async (patientId?: string) => {
    const targetPatientId = patientId ?? selectedPatientId;

    if (!targetPatientId) {
      Alert.alert('Select a patient first', 'Create or choose a patient before uploading a clip.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Media access needed',
        'Please allow access to your media library so clips can be attached to a patient profile.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const analysis = addAnalysisFromClip(targetPatientId, result.assets[0]);

    router.push({
      pathname: '/analysis/[id]',
      params: { id: analysis.id },
    });
  };

  return { pickClip };
}
