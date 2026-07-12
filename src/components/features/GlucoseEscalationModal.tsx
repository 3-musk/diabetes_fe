import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { glucose as GLUCOSECONSTANTS } from '../../constants/glucose';
import { borderRadius, colors, fontSize, spacing } from '../../theme';
import { AppModal } from '../ui/AppModal';
import AppText from '../ui/AppText';

export type ImmediateAction = {
  title: string;
  shortText: string;
  description: string;
  icon: string;
};

export type GuidelinesData = {
  type: string;
  immediateAction?: ImmediateAction[];
  recheckTimer?: string;
  escalation?: string;
};

type GlucoseEscalationModalProps = {
  visible: boolean;
  type: 'low' | 'high';
  value: number;
  readingType: string;
  guidelines: GuidelinesData | null;
  showRecheckOption: boolean;
  onClose: () => void;
  onRecheck: () => void;
};

const getFaIcon = (apiIcon: string) => {
  const lower = apiIcon?.toLowerCase() || '';
  if (lower.includes('food')) return 'cutlery';
  if (lower.includes('water')) return 'tint';
  if (lower.includes('exercise')) return 'heartbeat';
  if (lower.includes('seat') || lower.includes('rest')) return 'bed';
  return 'info-circle';
};

export function GlucoseEscalationModal({
  visible,
  type,
  value,
  readingType,
  guidelines,
  showRecheckOption,
  onClose,
  onRecheck,
}: GlucoseEscalationModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const title = type === 'low' ? GLUCOSECONSTANTS.lowGlucoseTitle : GLUCOSECONSTANTS.highGlucoseTitle;
  const headerBg = '#FFF5F5';
  const titleColor = '#FF3B30'; // red
  const isHigh = type === 'high';

  // Format reading type to Title Case (e.g., "fasting" -> "Fasting")
  const formattedReadingType = readingType
    ? readingType.charAt(0).toUpperCase() + readingType.slice(1).replace('_', ' ')
    : '';

  return (
    <AppModal visible={visible} onClose={onClose} cardStyle={styles.card} maxHeight={'90%'}>
      {/* Top Pink Section */}
      <View style={[styles.headerSection, { backgroundColor: headerBg }]}>
        <View
          style={{
            backgroundColor: titleColor,
            alignSelf: 'flex-start',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            marginBottom: spacing.xs,
          }}
        >
          <AppText variant="medium" style={{ color: colors.primaryBackground, fontSize: 12 }}>
            {title}
          </AppText>
        </View>
        <AppText variant='semibold' style={styles.subtitle}>
          {value}
        </AppText>
        <AppText style={styles.unit}>
          mg/dl
        </AppText>
      </View>

      {/* Bottom Content Section */}
      <View style={styles.contentSection}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {guidelines?.immediateAction && guidelines.immediateAction.length > 0 && (
            <View style={styles.gridContainer}>
              {guidelines.immediateAction.map((action, idx) => (
                <View key={idx} style={styles.gridCard}>
                  <FontAwesome name={getFaIcon(action.icon)} size={20} color={colors.textPrimary} style={styles.cardIcon} />
                  <AppText variant='medium' style={styles.cardTitle}>{action.title}</AppText>
                  <AppText style={styles.cardSubTitle}>{action.shortText}</AppText>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {showRecheckOption && (
          <Pressable style={styles.recheckBtn} onPress={onRecheck}>
            <AppText variant="semibold" style={styles.recheckText}>
              {guidelines?.recheckTimer || GLUCOSECONSTANTS.continueRecheck}
            </AppText>
          </Pressable>
        )}
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 500,
    padding: 20
  },
  headerSection: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg
  },
  title: {
    fontSize: 12,
    color: colors.primaryBackground,
    marginBottom: spacing.xs,
    flexGrow: 0
  },
  subtitle: {
    fontSize: 34,
    color: '#000',
  },
  unit: {
    fontSize: fontSize.sm,
    color: '#000',
  },
  rangeContainer: {
    marginBottom: spacing.xs,
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
  contentSection: {
    padding: spacing.md,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFF',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  gridCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: 800,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
  },
  cardSubTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  recheckBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  recheckText: {
    color: colors.primary,
    fontSize: fontSize.md,
  },
});
