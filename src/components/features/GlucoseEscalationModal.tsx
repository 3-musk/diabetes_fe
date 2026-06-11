import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSize, spacing } from '../../theme';
import AppText from '../ui/AppText';
import { AppModal } from '../ui/AppModal';

export type NextStepsData = {
  title: string;
  steps: string[];
};

type GlucoseEscalationModalProps = {
  visible: boolean;
  type: 'low' | 'high';
  value: number;
  readingType: string;
  nextSteps: NextStepsData | null;
  onClose: () => void;
  onRecheck: () => void;
};

export function GlucoseEscalationModal({
  visible,
  type,
  value,
  readingType,
  nextSteps,
  onClose,
  onRecheck,
}: GlucoseEscalationModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const title = type === 'low' ? 'Low glucose - act right now' : 'High glucose - act right now';
  const headerBg = '#FFF5F5';
  const titleColor = '#FF3B30'; // red
  const isHigh = type === 'high';

  // Format reading type to Title Case (e.g., "fasting" -> "Fasting")
  const formattedReadingType = readingType
    ? readingType.charAt(0).toUpperCase() + readingType.slice(1).replace('_', ' ')
    : '';

  return (
    <AppModal visible={visible} onClose={onClose} cardStyle={styles.card}>
      {/* Top Pink Section */}
      <View style={[styles.headerSection, { backgroundColor: headerBg }]}>
        <AppText variant="bold" style={[styles.title, { color: titleColor }]}>
          {title}
        </AppText>
        <AppText style={styles.subtitle}>
          {value} mg/dl - {formattedReadingType}
        </AppText>

        {/* Range Bar */}
        <View style={styles.rangeContainer}>
          <View style={styles.rangeBar}>
            <View style={[styles.rangeSegment, { backgroundColor: '#FF3B30', flex: isHigh ? 1 : 1.5 }]} />
            <View style={[styles.rangeSegment, { backgroundColor: '#FF9500', flex: 1 }]} />
            <View style={[styles.rangeSegment, { backgroundColor: '#34C759', flex: isHigh ? 2 : 4 }]} />
            <View style={[styles.rangeSegment, { backgroundColor: '#FF3B30', flex: isHigh ? 1.5 : 1 }]} />
            
            {/* Thumb Indicator */}
            <View style={[
              styles.rangeThumb, 
              { left: isHigh ? '85%' : '15%' } // Approximate thumb position
            ]} />
          </View>
          <View style={styles.rangeLabels}>
            <AppText style={styles.rangeLabelText}>Critical &lt; {isHigh ? '54' : '40'}</AppText>
            <AppText style={styles.rangeLabelText}>Low &lt; {isHigh ? '70' : '54'}</AppText>
            <AppText style={styles.rangeLabelText}>High {isHigh ? '' : '> 250'}</AppText>
          </View>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <FontAwesome name="play-circle" size={16} color="#FF3B30" style={{ marginRight: 8 }} />
          <AppText style={styles.warningText}>You have 10-15 mins to act</AppText>
        </View>
      </View>

      {/* Bottom Content Section */}
      <View style={styles.contentSection}>
        {nextSteps && (
          <>
            <AppText variant="semibold" style={styles.stepsTitle}>
              {nextSteps.title}
            </AppText>
            <AppText style={styles.stepsSubtitle}>
              Choose ONE - consume immediately
            </AppText>

            <View style={styles.pillsContainer}>
              {nextSteps.steps.map((step, idx) => (
                <View key={idx} style={styles.pill}>
                  <AppText style={styles.pillText}>{step}</AppText>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ flex: 1 }} />

        <Pressable style={styles.recheckBtn} onPress={onRecheck}>
          <AppText variant="semibold" style={styles.recheckText}>
            Continue to recheck
          </AppText>
        </Pressable>
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 500,
  },
  headerSection: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  rangeContainer: {
    marginBottom: spacing.xl,
  },
  rangeBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  rangeSegment: {
    height: '100%',
  },
  rangeThumb: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#D1D1D6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabelText: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  warningText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
  },
  contentSection: {
    padding: spacing.xl,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopWidth: 0,
    backgroundColor: '#FFF',
  },
  stepsTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepsSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFF',
  },
  pillText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  recheckBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  recheckText: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
});
