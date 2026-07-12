import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import { colors, spacing } from '../../theme';

export interface BarChartProps {
  data: number[];
  labels: string[];
  yAxisLabels: number[];
  optimalRange?: [number, number]; // [min, max]
  height?: number;
  width?: number; // Optional override
  color?: string;
  dataPointLabels?: string[];
}

export function BarChart({
  data,
  labels,
  yAxisLabels,
  height = 200,
  width: propWidth,
  color = colors.primary,
  dataPointLabels,
}: BarChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = propWidth || screenWidth - spacing.xl * 2 - 40;

  // Sticky Y-axis dimensions
  const yAxisLabelWidth = 40;
  const xAxisLabelsHeight = 30;
  const yAxisExtraHeight = 10;

  // Scrollable area (excludes sticky y-axis)
  const scrollAreaWidth = containerWidth - yAxisLabelWidth;

  const barWidth = 32;
  const barSpacing = 32;
  const initialSpacing = 16;
  const endSpacing = 30;

  // Natural content width (no y-axis)
  const contentWidth = initialSpacing + data.length * (barWidth + barSpacing) + endSpacing;
  const chartInnerWidth = Math.max(scrollAreaWidth, contentWidth);

  // Format data for gifted-charts
  const chartData = data.map((val, index) => ({
    value: val,
    label: labels[index] || '',
    topLabelComponent: () => null,
    customLabel: dataPointLabels ? dataPointLabels[index] : '',
    frontColor: color,
  }));

  const maxY = Math.max(...(yAxisLabels.length ? yAxisLabels : [100]));
  const noOfSections = yAxisLabels.length > 1 ? yAxisLabels.length - 1 : 1;
  const stepValue = maxY / noOfSections;

  // Sorted top→bottom for rendering
  const sortedYLabels = [...yAxisLabels].sort((a, b) => b - a);

  return (
    <View style={[styles.wrapper, { width: containerWidth }]}>
      {/* Sticky Y-axis */}
      <View style={[styles.yAxis, { width: yAxisLabelWidth, height: height + yAxisExtraHeight }]}>
        {sortedYLabels.map((label, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: (i / (sortedYLabels.length - 1)) * height,
              right: 4,
              alignItems: 'flex-end',
            }}
          >
            <Text style={styles.yLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Scrollable chart area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: scrollAreaWidth }}
        scrollEnabled={contentWidth > scrollAreaWidth}
        bounces={false}
      >
        <View style={styles.container}>
          <GiftedBarChart
            data={chartData}
            height={height}
            width={chartInnerWidth}
            maxValue={maxY}
            noOfSections={noOfSections}
            stepValue={stepValue}
            // Hide built-in y-axis — we render our own sticky one
            yAxisLabelWidth={0}
            hideYAxisText={true}
            yAxisColor="transparent"
            barWidth={barWidth}
            spacing={barSpacing}
            roundedTop
            roundedBottom={false}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, textAlign: 'left' }}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            rulesType="solid"
            rulesColor={colors.border}
            xAxisColor={colors.border}
            hideRules={false}
            showYAxisIndices={false}
            showXAxisIndices={true}
            xAxisIndicesColor={colors.border}
            xAxisIndicesHeight={4}
            rotateLabel={true}
            xAxisLabelsHeight={xAxisLabelsHeight}
            yAxisExtraHeight={yAxisExtraHeight}
            initialSpacing={initialSpacing}
            endSpacing={endSpacing}
            isAnimated={true}
            animationDuration={600}
            renderTooltip={(item: any) => {
              return (
                <View
                  style={{
                    width: 80,
                    backgroundColor: '#333',
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    borderRadius: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: -30,
                    marginLeft: -10,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, textAlign: 'center' }}>
                    {item.customLabel || ''}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginVertical: spacing.md,
    overflow: 'hidden',
  },
  yAxis: {
    position: 'relative',
  },
  yLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  container: {
    position: 'relative',
  },
});
