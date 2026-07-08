import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

interface RoundCheckBoxProps {
  selected: boolean;
  disabled?: boolean;
}

export function RoundCheckBox({ selected, disabled }: RoundCheckBoxProps) {
  return (
    <View style={[
      styles.radioOuter, 
      selected && styles.radioOuterSelected,
      disabled && styles.radioOuterDisabled
    ]}>
      {selected && <FontAwesome name="check" size={10} color={disabled ? colors.textTertiary : colors.primaryBackground} />}
    </View>
  );
}

const styles = StyleSheet.create({
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  radioOuterDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.border,
  },
});
