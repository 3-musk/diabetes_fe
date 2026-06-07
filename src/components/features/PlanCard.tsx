import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from '../../theme';
import AppText from '../ui/AppText';
import { RoundCheckBox } from '../inputs/RoundCheckBox';

interface PlanCardProps {
  name: string;
  price: number;
  duration: string;
  features: string[];
  isSelected?: boolean;
  onPress: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  duration,
  features,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        isSelected && styles.selectedCard,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <AppText
          variant="medium"
          style={styles.planName}
        >
          {name}
        </AppText>

        <RoundCheckBox selected={isSelected} />
      </View>

      <View style={styles.priceContainer}>
        <AppText
          variant="bold"
          style={styles.price}
        >
          ₹{price}
        </AppText>

        <AppText style={styles.duration}>
          / {duration}
        </AppText>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View
            key={index}
            style={styles.featureRow}
          >
            <AppText style={styles.bullet}>
              •
            </AppText>

            <AppText style={styles.featureText}>
              {feature}
            </AppText>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  planName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  selectedIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedText: {
    color: colors.primaryBackground,
    fontSize: 10,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },

  price: {
    fontSize: 26,
    color: colors.textPrimary,
  },

  duration: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: 4,
    marginBottom: 3,
  },

  featuresContainer: {
    gap: spacing.sm,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  bullet: {
    color: colors.textPrimary,
    marginRight: spacing.sm,
    lineHeight: 20,
  },

  featureText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
});

export default PlanCard;