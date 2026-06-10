import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';
import Input from '../inputs/Input';
import AppText from '../ui/AppText';
import Button from '../ui/Button';

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.overlay}>
          <View style={[s.sheet, { marginTop: insets.top + 60, paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            
            {/* Close Button above the sheet */}
            <Pressable style={s.closeBtnOuter} onPress={onClose}>
              <View style={s.closeBtn}>
                <FontAwesome name="times" size={16} color={colors.textPrimary} />
              </View>
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
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

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    ...shadows.lg,
  },
  closeBtnOuter: {
    alignSelf: 'center',
    marginTop: -48,
    marginBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  saveText: { 
    color: colors.primaryForeground, 
    fontSize: fontSize.md, 
    fontWeight: '600' 
  },
});
