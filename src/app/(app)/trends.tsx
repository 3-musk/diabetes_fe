import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, DateStrip, HeaderActionIcons, PillTabs, TrendChartCard } from '../../components';
import { getTrendData, TrendDataResponse, TrendMetric } from '../../services/trendService';
import { colors, fontSize, spacing } from '../../theme';

import { GLUCOSE_FILTERS, METRICS } from '../../constants/uiConstants';

type Metric = typeof METRICS[number];
type GlucoseFilter = typeof GLUCOSE_FILTERS[number];

export default function TrendsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState<TrendMetric>('Glucose');
  const [glucoseFilter, setGlucoseFilter] = useState<GlucoseFilter>('All');
  
  const [loading, setLoading] = useState(true);
  const [chartProps, setChartProps] = useState<TrendDataResponse | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getTrendData(selectedMetric, selectedMetric === 'Glucose' ? glucoseFilter : undefined);
        if (isMounted) {
          setChartProps(data);
        }
      } catch (error) {
        console.error('Failed to fetch trend data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedMetric, glucoseFilter, selectedDate]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <AppText variant="bold" style={styles.headerTitle}>Trends</AppText>
        <HeaderActionIcons />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Strip */}
        <DateStrip 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
        />

        {/* Metric Selector */}
        <PillTabs
          options={METRICS}
          selected={selectedMetric}
          onSelect={setSelectedMetric}
          style={styles.metricTabs}
        />

        {/* Chart Card */}
        {loading || !chartProps ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <TrendChartCard
            title={chartProps.title}
            filterOption={chartProps.filterOption}
            data={chartProps.data}
            // data={[]}
            labels={chartProps.labels}
            yAxisLabels={chartProps.yAxisLabels}
            optimalRange={chartProps.optimalRange}
            showBottomToggle={selectedMetric === 'Glucose'}
            bottomToggleOptions={GLUCOSE_FILTERS}
            bottomToggleSelected={glucoseFilter}
            onBottomToggleSelect={(val) => setGlucoseFilter(val as GlucoseFilter)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
  },
  metricTabs: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  loaderContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
