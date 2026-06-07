import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { borderRadius, colors, fontSize, spacing } from '../../theme';
import AppText from '../ui/AppText';
import { RoundCheckBox } from './RoundCheckBox';

interface RadioRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function RadioRow({ label, selected, onPress }: RadioRowProps) {
  return (
    <Pressable style={[styles.radioRow, selected && styles.radioRowSelected]} onPress={onPress}>
      <AppText style={[styles.rowLabel, selected && styles.rowLabelSelected]}>
        {label}
      </AppText>
      <RoundCheckBox selected={selected} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: '#F9F6EF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radioRowSelected: {
    borderColor: colors.primary,
  },
  rowLabel: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flex: 1,
  },
  rowLabelSelected: {
    color: colors.textPrimary,
  },
});
