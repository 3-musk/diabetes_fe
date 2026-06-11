import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';
import Input from '../inputs/Input';
import AppText from '../ui/AppText';
import Button from '../ui/Button';
import { AppModal } from '../ui/AppModal';

export type NewActivityData = {
  exerciseType: string;
  duration: number;
  description?: string;
};

type AddActivityModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: NewActivityData) => void;
};

export function AddActivityModal({ visible, onClose, onSave }: AddActivityModalProps) {
  const insets = useSafeAreaInsets();
  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setExerciseType('');
      setDuration('');
      setDescription('');
    }
  }, [visible]);

  const handleSave = () => {
    const durNum = parseInt(duration, 10);
    if (!exerciseType.trim() || isNaN(durNum) || durNum <= 0) {
      // Basic validation: could show an alert here in a real app
      return;
    }
    onSave({
      exerciseType: exerciseType.trim(),
      duration: durNum,
      description: description.trim() || undefined,
    });
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <AppText variant="semibold" style={s.sheetTitle}>Add Activity</AppText>

        <Input
          label="Exercise Type"
          required
          placeholder="Enter Details"
          value={exerciseType}
          onChangeText={setExerciseType}
        />

        <Input
          label="Duration (mins)"
          required
          placeholder="Enter Details"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />

        <Input
          label="Description"
          placeholder="Enter Details"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ height: 80, textAlignVertical: 'top' }}
        />

        <Button
          title="Save"
          onPress={handleSave}
        />
      </ScrollView>
    </AppModal>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  sheetTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xxxl,
  },
});
