import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { StyleSheet, View } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../theme';
import AppText from '../ui/AppText';
import { LineChart } from '../ui/LineChart';
import { PillTabs } from '../ui/PillTabs';

export interface TrendChartCardProps {
  title: string;
  filterOption?: string;
  onFilterPress?: () => void;
  // Chart props
  data: number[];
  labels: string[];
  yAxisLabels: number[];
  optimalRange?: [number, number];
  // Bottom toggle (specifically for Glucose)
  showBottomToggle?: boolean;
  bottomToggleOptions?: readonly string[];
  bottomToggleSelected?: string;
  onBottomToggleSelect?: (val: string) => void;
}

export function TrendChartCard({
  title,
  filterOption,
  onFilterPress,
  data,
  labels,
  yAxisLabels,
  optimalRange,
  showBottomToggle,
  bottomToggleOptions,
  bottomToggleSelected,
  onBottomToggleSelect,
}: TrendChartCardProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="semibold" style={styles.title}>
          {title}
        </AppText>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {data.length === 0 ? (
          <View style={styles.noDataContainer}>
            <FontAwesome name="line-chart" size={32} color={colors.textTertiary} />
            <AppText style={styles.noDataText}>No data available</AppText>
          </View>
        ) : (
          <LineChart
            data={data}
            labels={labels}
            yAxisLabels={yAxisLabels}
            optimalRange={optimalRange}
            height={220}
          />
        )}
      </View>

      {/* Bottom Toggle */}
      {showBottomToggle && bottomToggleOptions && onBottomToggleSelect && (
        <View style={styles.bottomToggleContainer}>
          <PillTabs
            options={bottomToggleOptions}
            selected={bottomToggleSelected || bottomToggleOptions[0]}
            onSelect={onBottomToggleSelect}
            style={styles.bottomPillTabs}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#F1DAB0', // Soft yellowish/orange border from mockup
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  dropdownText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  chartContainer: {
    alignItems: 'center',
    minHeight: 220,
    justifyContent: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  noDataText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  bottomToggleContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  bottomPillTabs: {
    flex:1,
    marginVertical: 0,
    backgroundColor: '#FAF7F0',
    borderRadius: borderRadius.full,
    // padding: spacing.xs,
    gap:4
  },
});
