import { Pressable, StyleSheet, View } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../theme';
import AppText from './AppText';

export interface PillTabsProps<T extends string> {
  options: readonly T[];
  selected: T;
  onSelect: (option: T) => void;
  style?: any;
}

export function PillTabs<T extends string>({
  options,
  selected,
  onSelect,
  style,
}: PillTabsProps<T>) {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <Pressable
            key={option}
            style={[
              styles.pill,
              isActive ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => onSelect(option)}
          >
            <AppText
              variant="semibold"
              style={[
                styles.text,
                isActive ? styles.textActive : styles.textInactive,
              ]}
            >
              {option.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginVertical: spacing.md
  },
  pill: {
    minWidth: 50,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
  },
  textInactive: {
    color: colors.textSecondary,
  },
  textActive: {
    color: '#FFFFFF',
  },
});
