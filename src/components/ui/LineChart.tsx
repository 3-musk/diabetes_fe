import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { colors, spacing } from '../../theme';

export interface LineChartProps {
  data: number[];
  displayDataPoints?: boolean;
  labels: string[];
  yAxisLabels: number[];
  optimalRange?: [number, number]; // [min, max]
  height?: number;
  width?: number; // Optional override
  color?: string;
  dataPointLabels?: string[];
}

export function LineChart({
  data,
  labels,
  yAxisLabels,
  height = 200,
  width: propWidth,
  color = '#4CAF50',
  displayDataPoints = true,
  dataPointLabels,
}: LineChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = propWidth || screenWidth - spacing.xl * 2 - 40;

  // Sticky Y-axis dimensions
  const yAxisLabelWidth = 40;
  const xAxisLabelsHeight = 60;
  const yAxisExtraHeight = 10; // small top padding

  // Scrollable area width (excludes sticky y-axis)
  const scrollAreaWidth = containerWidth - yAxisLabelWidth;

  const pointSpacing = 60;
  const initialSpacing = 16;
  const endSpacing = 30;

  // Natural content width (no y-axis — we render it ourselves)
  const contentWidth = initialSpacing + (data.length - 1) * pointSpacing + endSpacing;
  const chartInnerWidth = Math.max(scrollAreaWidth, contentWidth);

  // Format data for gifted-charts
  const chartData = data.map((val, index) => ({
    value: val,
    label: labels[index] || '',
    dataPointText: '',
    customLabel: dataPointLabels ? dataPointLabels[index] : '',
  }));

  const maxY = Math.max(...(yAxisLabels.length ? yAxisLabels : [100]));
  const noOfSections = yAxisLabels.length > 1 ? yAxisLabels.length - 1 : 1;
  const stepValue = maxY / noOfSections;

  // Build sorted Y labels from bottom to top for rendering top→bottom
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
          <GiftedLineChart
            data={chartData}
            height={height}
            width={chartInnerWidth}
            maxValue={maxY}
            noOfSections={noOfSections}
            stepValue={stepValue}
            // Hide the built-in y-axis — we render our own sticky one
            yAxisLabelWidth={0}
            hideYAxisText={true}
            yAxisColor="transparent"
            color={color}
            thickness={2}
            dataPointsColor={color}
            dataPointsRadius={displayDataPoints ? 4 : 0}
            textFontSize={10}
            textColor={colors.textSecondary}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center' }}
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
            spacing={pointSpacing}
            isAnimated={true}
            animationDuration={600}
            pointerConfig={{
              pointerStripUptoDataPoint: true,
              pointerStripColor: 'rgba(0,0,0,0.2)',
              pointerStripWidth: 2,
              strokeDashArray: [2, 5],
              pointerColor: color,
              radius: 6,
              pointerLabelWidth: 80,
              pointerLabelHeight: 30,
              pointerLabelComponent: (items: any) => {
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
                      marginLeft: -40,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 10, textAlign: 'center' }}>
                      {items[0]?.customLabel || ''}
                    </Text>
                  </View>
                );
              },
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
