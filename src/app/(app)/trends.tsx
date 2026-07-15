import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { AppText, DateStrip, HeaderActionIcons, PillTabs, ScreenContainer, TrendChartCard } from '../../components';
import { getTrendData, TrendDataResponse, TrendMetric } from '../../services/trendService';
import { colors, fontSize, spacing } from '../../theme';

import { trendsTexts } from '../../constants/trendData';
import { GLUCOSE_FILTERS, METRICS } from '../../constants/uiConstants';
import { useAuth } from '../../context/AuthContext';

type Metric = typeof METRICS[number];
type GlucoseFilter = typeof GLUCOSE_FILTERS[number];

export default function TrendsScreen() {
  const { accessToken } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState<TrendMetric>('Glucose');
  const [glucoseFilter, setGlucoseFilter] = useState<GlucoseFilter>('ALL');
  const [range, setRange] = useState<string>('1m');
  
  const [loading, setLoading] = useState(true);
  const [chartProps, setChartProps] = useState<TrendDataResponse | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadData = async () => {
        setLoading(true);
        try {
          const format = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const dateStr = format(selectedDate);
          
          // Pass range, from, to, and readingType
          const data = await getTrendData(
            accessToken ?? '',
            selectedMetric, 
            range, 
            dateStr, 
            dateStr, // For simplicity using selectedDate for both, could adjust based on range if API doesn't handle it
            selectedMetric === 'Glucose' ? glucoseFilter : undefined
          );
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
    }, [selectedMetric, glucoseFilter, selectedDate, range, accessToken])
  );

  return (
    <ScreenContainer edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <AppText variant="bold" style={styles.headerTitle}>{trendsTexts.pageTitle}</AppText>
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
            chartProps={chartProps}
            range={range}
            onRangeChange={setRange}
            showBottomToggle={selectedMetric === 'Glucose'}
            bottomToggleOptions={GLUCOSE_FILTERS}
            bottomToggleSelected={glucoseFilter}
            onBottomToggleSelect={(val) => setGlucoseFilter(val as GlucoseFilter)}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
