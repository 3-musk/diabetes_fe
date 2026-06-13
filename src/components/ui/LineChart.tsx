import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { colors, spacing } from '../../theme';

export interface LineChartProps {
  data: number[];
  labels: string[];
  yAxisLabels: number[];
  optimalRange?: [number, number]; // [min, max]
  height?: number;
  width?: number; // Optional override
  color?: string;
}

export function LineChart({
  data,
  labels,
  yAxisLabels,
  optimalRange,
  height = 200,
  width: propWidth,
  color = '#4CAF50',
}: LineChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  // Subtracting horizontal padding of the card container (e.g. 24 on each side)
  const chartWidth = propWidth || screenWidth - spacing.xl * 2 - 40; 
  
  // Format data for gifted-charts
  const chartData = data.map((val, index) => ({
    value: val,
    label: labels[index] || '',
    dataPointText: '', // Hide default text
  }));

  const maxY = Math.max(...(yAxisLabels.length ? yAxisLabels : [100]));
  const noOfSections = yAxisLabels.length > 1 ? yAxisLabels.length - 1 : 1;
  const stepValue = maxY / noOfSections;

  // Optimal range background calculation
  // GiftedLineChart's "height" refers to the y-axis line length.
  let rangeTop = 0;
  let rangeHeight = 0;
  if (optimalRange) {
    const [min, max] = optimalRange;
    const boundedMax = Math.min(max, maxY);
    const boundedMin = Math.max(min, 0);
    
    rangeHeight = ((boundedMax - boundedMin) / maxY) * height;
    rangeTop = height - (boundedMax / maxY) * height;
  }

  // The chart leaves some space for the y-axis labels. Gifted chart uses around 40-50px by default for yAxisLabelWidth.
  const yAxisLabelWidth = 40;

  return (
    <View style={[styles.container, { width: chartWidth }]}>
      {/* Optimal Range Background - manually positioned behind the chart */}
      {/* {optimalRange && (
        <View
          style={{
            position: 'absolute',
            left: yAxisLabelWidth,
            right: 0,
            top: rangeTop + 10, // +10 is gifted-chart's default vertical padding (yAxisExtraHeightAtTop etc if applicable, usually slight offset. We'll fine tune to 10 for safe area)
            height: rangeHeight,
            backgroundColor: '#E8F8EE', // Very light green
            zIndex: 0,
          }}
        />
      )} */}

      <View style={{ zIndex: 1 }}>
        <GiftedLineChart
          data={chartData}
          height={height}
          width={chartWidth - yAxisLabelWidth - 10} // Adjust for label width
          maxValue={maxY}
          noOfSections={noOfSections}
          stepValue={stepValue}
          yAxisLabelWidth={yAxisLabelWidth}
          color={color}
          thickness={2}
          dataPointsColor={color}
          dataPointsRadius={4}
          textFontSize={10}
          textColor={colors.textSecondary}
          xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          rulesType="solid"
          rulesColor={colors.border}
          yAxisColor={colors.border}
          xAxisColor={colors.border}
          hideRules={false}
          hideYAxisText={false}
          showYAxisIndices={false}
          showXAxisIndices={true}
          xAxisIndicesColor={colors.border}
          xAxisIndicesHeight={4}
          initialSpacing={20}
          endSpacing={20}
          isAnimated={true}
          animationDuration={600}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    position: 'relative',
  },
});
