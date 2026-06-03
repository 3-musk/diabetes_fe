import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import AppText from "../AppText";

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
  ranges: GaugeRange[];
  size?: number;
};

export default function GlucoseGauge({
  value,
  min,
  max,
  unit,
  status,
  ranges,
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

  const valuePercentage = Math.max(
    0,
    Math.min(1, (value - min) / (max - min))
  );

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
        {ranges.map((range, index) => {

          const start =
            -90 +
            ((range.from - min) / (max - min)) * 180 + gap;

          const end =
            -90 +
            ((range.to - min) / (max - min)) * 180 - gap;

          return (
            <Path
              key={index}
              d={describeArc(
                centerX,
                centerY,
                radius,
                start,
                end
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
          stroke={
            ranges.find(
              (r) => value >= r.from && value <= r.to
            )?.color ?? "#000"
          }
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
    backgroundColor: "#E7F5E8",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: "#15933A",
    fontWeight: "600",
  },
});