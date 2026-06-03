import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../theme';
import AppText from './AppText';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'large',
  fullScreen = false,
}) => {
  const content = (
    <>
      <ActivityIndicator size={size} color={colors.primary} />
      {text && <AppText style={styles.text}>{text}</AppText>}
    </>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});

export default LoadingSpinner;
