import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { borderRadius, colors, shadows, spacing } from '../../theme';
import AppText from '../ui/AppText';
import { LineChart } from '../ui/LineChart';
import { BarChart } from '../ui/BarChart';
import { PillTabs } from '../ui/PillTabs';
import { TrendDataResponse } from '../../services/trendService';

export interface TrendChartCardProps {
  chartProps: TrendDataResponse;
  range: string;
  onRangeChange: (val: string) => void;
  // Bottom toggle (specifically for Glucose)
  showBottomToggle?: boolean;
  bottomToggleOptions?: readonly string[];
  bottomToggleSelected?: string;
  onBottomToggleSelect?: (val: string) => void;
}

export function TrendChartCard({
  chartProps,
  range,
  onRangeChange,
  showBottomToggle,
  bottomToggleOptions,
  bottomToggleSelected,
  onBottomToggleSelect,
}: TrendChartCardProps) {
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  
  const formatTime12h = (time: string) => {
    const parts = time.split(':');
    if (parts.length < 2) return time;
    let hour = parseInt(parts[0], 10);
    const m = parts[1];
    if (isNaN(hour)) return time;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${m} ${ampm}`;
  };

  const data = chartProps.points?.map(p => p.y) || [];
  const labels = chartProps.points?.map(p => formatTime12h(p.x)) || [];
  const dataPointLabels = chartProps.points?.map(p => p.xLabel) || [];
  const yAxisLabels = chartProps.yLabel?.map(y => parseInt(y, 10)) || [];
  const title = chartProps.tab ? chartProps.tab.charAt(0).toUpperCase() + chartProps.tab.slice(1) : 'Trend';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="semibold" style={styles.title}>
          {title}
        </AppText>
        <View style={styles.rangeDropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowRangeDropdown(!showRangeDropdown)}
            activeOpacity={0.7}
          >
            <AppText style={styles.dropdownText}>{range}</AppText>
            <FontAwesome name={showRangeDropdown ? "chevron-up" : "chevron-down"} size={12} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {showRangeDropdown && (
            <View style={styles.dropdownList}>
              {['1w', '1m', '3m', '6m', '1y'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.dropdownOption}
                  onPress={() => {
                    onRangeChange(opt);
                    setShowRangeDropdown(false);
                  }}
                >
                  <AppText style={styles.dropdownOptionText}>{opt}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {data.length === 0 ? (
          <View style={styles.noDataContainer}>
            <FontAwesome name="line-chart" size={32} color={colors.textTertiary} />
            <AppText style={styles.noDataText}>No data available</AppText>
          </View>
        ) : chartProps.chartType?.toLowerCase() === 'bar' ? (
          <BarChart
            data={data}
            labels={labels}
            yAxisLabels={yAxisLabels}
            dataPointLabels={dataPointLabels}
            height={220}
          />
        ) : (
          <LineChart
            data={data}
            labels={labels}
            yAxisLabels={yAxisLabels}
            dataPointLabels={dataPointLabels}
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
  rangeDropdownContainer: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownList: {
    position: 'absolute',
    top: 32,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    width: 80,
    overflow: 'hidden',
    ...shadows.sm,
  },
  dropdownOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownOptionText: {
    color: colors.textPrimary,
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
