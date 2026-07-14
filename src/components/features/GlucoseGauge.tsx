import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import AppText from "../ui/AppText";

type GaugeRange = {
  from: number;
  to: number;
  color: string;
};

type Props = {
  value: number;
  min: number;
  max: number;
  unit: string;
  status: string;
  ranges?: GaugeRange[];
  labels?: string[];
  size?: number;
};

export default function GlucoseGauge({
  value,
  min,
  max,
  unit,
  status,
  ranges,
  labels,
  size = 280,
}: Props) {
  const strokeWidth = 6;
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;
  const gap = 2;

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angle: number
  ) => {
    const rad = ((angle - 90) * Math.PI) / 180;

    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  };

  const DEFAULT_COLORS = ['#15933A', '#c9b90d', '#e99313ff', '#e3130b', '#7b0909', '#5c0000'];
  
  const LABEL_COLORS: Record<string, string> = {
    NORMAL: '#15933A',
    MODERATE: '#c9b90d',
    HIGH_RISK: '#e99313ff',
    CRITICAL: '#e3130b',
    EMERGENCY: '#7b0909',
  };

  let computedRanges = ranges || [];
  let valuePercentage = 0;
  let strokeColor = "#000";

  const isLabelMode = labels && labels.length > 0;

  if (isLabelMode) {
    const segmentSize = 100 / labels!.length;
    computedRanges = labels!.map((label, i) => {
      const color = LABEL_COLORS[label.toUpperCase()] || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      return {
        from: i * segmentSize,
        to: (i + 1) * segmentSize,
        color
      };
    });
    
    const statusIndex = labels!.indexOf(status);
    if (statusIndex !== -1) {
      valuePercentage = (statusIndex * segmentSize + segmentSize / 2) / 100;
      strokeColor = computedRanges[statusIndex].color;
    }
  } else {
    valuePercentage = Math.max(0, Math.min(1, (value - min) / (max - min)));
    strokeColor = computedRanges.find(r => value >= r.from && value <= r.to)?.color ?? "#000";
  }

  const pointerAngle = -90 + valuePercentage * 180;

  const pointer = polarToCartesian(
    centerX,
    centerY,
    radius,
    pointerAngle
  );

  return (
    <View style={[styles.container, { width: size }]}>
      <Svg width={size} height={size / 2 + 30}>
        {computedRanges.map((range, index) => {
          
          let startAngle, endAngle;
          if (isLabelMode) {
            startAngle = -90 + (range.from / 100) * 180 + gap;
            endAngle = -90 + (range.to / 100) * 180 - gap;
          } else {
            startAngle = -90 + ((range.from - min) / (max - min)) * 180 + gap;
            endAngle = -90 + ((range.to - min) / (max - min)) * 180 - gap;
          }

          return (
            <Path
              key={index}
              d={describeArc(
                centerX,
                centerY,
                radius,
                startAngle,
                endAngle
              )}
              stroke={range.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}

        <Circle
          cx={pointer.x}
          cy={pointer.y}
          r={10}
          fill="#fff"
          stroke={strokeColor}
          strokeWidth={5}
        />
      </Svg>

      <View style={styles.centerContent}>
        <AppText style={styles.value}>
          {value}
        </AppText>

        <AppText style={styles.unit}>
          {unit}
        </AppText>

        <View style={styles.badge}>
          <AppText style={styles.badgeText}>
            {status}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    position: "absolute",
    top: 50,
    alignItems: "center",
  },
  value: {
    fontSize: 48,
    fontWeight: "700",
  },
  unit: {
    marginTop: -2,
    fontSize: 16,
    color: "#666",
  },
  badge: {
    marginTop: 16,
    backgroundColor: "#e7eee7",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: "#15933A",
    fontWeight: "600",
  },
});