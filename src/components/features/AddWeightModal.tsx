import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useState } from 'react';
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
import { AppText, Button, DateInput, Input } from '..';
import { weightTracker as WEIGHTTRACKERCONSTANTS } from '../../constants/weightTracker';
import type { WeightEntry } from '../../services/trackerService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

interface AddWeightModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (entry: WeightEntry) => void;
}

export function AddWeightModal({ visible, onClose, onSave }: AddWeightModalProps) {
    const insets = useSafeAreaInsets();
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);

    const handleSave = () => {
        const w = parseFloat(weight);
        if (!w || !date) return;

        const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

        onSave({ id: Date.now().toString(), date: formattedDate, weightKg: w, onTarget: w <= 76 });
        setWeight(''); setHeight(''); setDate(undefined);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={s.overlay}>
                    <View style={[s.card, { marginTop: insets.top + 60, paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
                        <Pressable style={s.closeBtnOuter} onPress={onClose}>
                            <View style={s.closeBtn}>
                                <FontAwesome name="times" size={16} color={colors.textPrimary} />
                            </View>
                        </Pressable>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                            <AppText variant="semibold" style={s.sheetTitle}>Add Weight</AppText>

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
    card: {
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
    },
    sheetTitle: {
        fontSize: 20,
        color: colors.textPrimary,
        marginBottom: spacing.xxxl,
    },
    actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
    cancelBtn: {
        flex: 1, borderWidth: 1, borderColor: colors.primary,
        borderRadius: borderRadius.full, alignItems: 'center', paddingVertical: spacing.md,
    },
    cancelText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600' },
    saveBtn: {
        flex: 1, backgroundColor: colors.primary,
        borderRadius: borderRadius.full, alignItems: 'center', paddingVertical: spacing.md,
    },
    saveText: { color: colors.primaryForeground, fontSize: fontSize.md, fontWeight: '600' },
});
