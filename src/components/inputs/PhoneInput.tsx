import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../theme';
import AppText from '../ui/AppText';

interface PhoneInputProps extends TextInputProps {
  label?: string;
  countryCode?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  countryCode,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <AppText variant="medium" style={styles.label}>{label}</AppText>}
      <View style={styles.phoneContainer}>
        {countryCode && <View style={styles.countryCodeContainer}>
          <AppText variant="medium" style={styles.countryCodeLabel}>{countryCode}</AppText>
        </View>}
        <TextInput
          style={[
            styles.input,
            countryCode && styles.inputWithCountryCode,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          {...props}
        />
      </View>
      {error && <AppText style={styles.errorText}>{error}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    width: "100%"
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 0,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    paddingVertical: 8
  },
  countryCodeContainer: {
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm
  },
  countryCodeLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: "#000000",
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  inputWithCountryCode: {
    paddingLeft: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default PhoneInput;
