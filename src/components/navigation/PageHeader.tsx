import { StyleSheet, View } from 'react-native';
import { colors, fontSize, spacing } from '../../theme';
import AppText from '../ui/AppText';
import { BackButton } from './BackButton';

type PageHeaderProps = {
  title?: string;
  rightElement?: React.ReactNode;
  onBack?: () => void;
};

export default function PageHeader({ title, rightElement, onBack }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <BackButton color={colors.primaryBackground} onPress={onBack} />
      {title && (
        <AppText variant="semibold" style={styles.headerTitle}>
          {title}
        </AppText>
      )}
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    flex: 1,
  },
  rightElement: {
    marginLeft: 'auto',
  },
});
