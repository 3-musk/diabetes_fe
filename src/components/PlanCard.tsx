import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../theme';

interface PlanCardProps {
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  isSelected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  duration,
  features,
  isPopular = false,
  isSelected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isPopular && styles.cardPopular,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>POPULAR</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.name, isSelected && styles.nameSelected]}>
          {name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && styles.priceSelected]}>
            ₹{price}
          </Text>
          <Text style={styles.duration}>{duration}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={[styles.checkmark, isSelected && styles.checkmarkSelected]}>✓</Text>
            <Text style={[styles.featureText, isSelected && styles.featureTextSelected]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.selectIndicator}>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.selectText}>{isSelected ? 'Selected' : 'Select'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  cardPopular: {
    borderColor: colors.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.xl,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  popularBadgeText: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  header: {
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  nameSelected: {
    color: colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  priceSelected: {
    color: colors.primary,
  },
  duration: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkmark: {
    color: colors.success,
    fontSize: fontSize.lg,
    marginRight: spacing.md,
    fontWeight: fontWeight.bold,
  },
  checkmarkSelected: {
    color: colors.primary,
  },
  featureText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    flex: 1,
  },
  featureTextSelected: {
    color: colors.textPrimary,
  },
  selectIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  selectText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});

export default PlanCard;