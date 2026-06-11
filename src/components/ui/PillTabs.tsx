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
              {option}
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
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  pillInactive: {
    // backgroundColor: '#FFFFFF',
    // ...shadows.sm,
    // Add a very subtle border instead of full shadow if needed, but shadow is good
  },
  pillActive: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  text: {
    flex:1,
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
