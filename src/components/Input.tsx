import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import {
  borderRadius,
  colors,
  fontSize,
  spacing
} from '../theme';
import AppText from './AppText';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  required = false,
  rightIcon,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <AppText
            variant="medium"
            style={styles.label}
          >
            {label}
          </AppText>

          {required && (
            <AppText style={styles.required}>
              *
            </AppText>
          )}
        </View>
      )}

      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.textLight}
          {...props}
        />
        {rightIcon && (
          <View style={{ position: 'absolute', right: 15, top: '50%', transform: [{ translateY: -10 }] }}>
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <AppText style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    width: '100%',
  },

  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  label: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },

  required: {
    color: colors.error,
    marginLeft: 4,
    fontSize: fontSize.lg,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    fontSize: fontSize.lg,
    backgroundColor: colors.surface,
    color: colors.textInput,
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

export default Input;