import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, AppModal, Button, DateInput, Input } from '..';
import { weightTracker as WEIGHTTRACKERCONSTANTS } from '../../constants/weightTracker';
import type { WeightEntry } from '../../services/trackerService';
import { colors, spacing } from '../../theme';

interface AddWeightModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (entry: WeightEntry) => Promise<{ success: boolean; message?: string }>;
}

export function AddWeightModal({ visible, onClose, onSave }: AddWeightModalProps) {
    const insets = useSafeAreaInsets();
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        if (!w || !h || !date) return;

        setIsSaving(true);
        const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

        const res = await onSave({ id: Date.now().toString(), date: formattedDate, weightKg: w, heightCm: h, onTarget: w <= 76 });
        setIsSaving(false);
        
        if (res && res.success) {
            setWeight(''); setHeight(''); setDate(undefined);
            onClose();
        } else {
            Alert.alert('Invalid Entry', res?.message || 'Failed to save weight reading. Please try again.');
        }
    };

    return (
        <AppModal visible={visible} onClose={onClose}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
                <AppText variant="semibold" style={s.sheetTitle}>{WEIGHTTRACKERCONSTANTS.addWeightTitle}</AppText>

                <Input
                    label={WEIGHTTRACKERCONSTANTS.weightLabel}
                    required
                    placeholder={WEIGHTTRACKERCONSTANTS.weightPlaceholder}
                    keyboardType="decimal-pad"
                    value={weight}
                    onChangeText={setWeight}
                />

                <Input
                    label={WEIGHTTRACKERCONSTANTS.heightLabel}
                    required
                    placeholder={WEIGHTTRACKERCONSTANTS.heightPlaceholder}
                    keyboardType="decimal-pad"
                    value={height}
                    onChangeText={setHeight}
                />

                <DateInput
                    label={WEIGHTTRACKERCONSTANTS.dateLabel}
                    required
                    value={date}
                    onChange={setDate}
                    dateFormat="yy/mm/dd"
                    placeholder={WEIGHTTRACKERCONSTANTS.datePlaceholder}
                />

                <View style={s.actions}>
                    <Button variant="outline" style={s.cancelBtn} title={WEIGHTTRACKERCONSTANTS.cancelBtn} onPress={onClose} />
                    <Button variant="primary" style={s.saveBtn} title={WEIGHTTRACKERCONSTANTS.saveBtn} onPress={handleSave} />
                </View>
            </ScrollView>
        </AppModal>
    );
}

const s = StyleSheet.create({
    scrollContent: {
        padding: spacing.xl,
        paddingTop: spacing.xxxl,
    },
    sheetTitle: {
        fontSize: 20,
        color: colors.textPrimary,
        marginBottom: spacing.xxxl,
    },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
    cancelBtn: { flex: 1 },
    saveBtn: { flex: 1 },
});
