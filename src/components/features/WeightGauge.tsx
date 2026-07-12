import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { weightTracker as WEIGHTTRACKERCONSTANTS } from '../../constants/weightTracker';
import AppText from '../ui/AppText';

interface WeightGaugeProps {
    current: number;
    target: number;
}

export function WeightGauge({ current, target }: WeightGaugeProps) {
    const size = 280;
    const r = 120;
    const cx = size / 2;
    const cy = size / 2;
    const gap = target > 0 ? Math.abs(current - target) : 0;

    // Arc from 180° to 0° (top semicircle, going clockwise)
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const arc = (deg: number) => ({
        x: cx + r * Math.cos(toRad(deg)),
        y: cy - r * Math.sin(toRad(deg)),
    });

    const startDeg = 180;
    const endDeg = 0;
    const start = arc(startDeg);
    const end = arc(endDeg);

    const maxGap = 20; // adjust as needed
    const ratio = Math.min(gap / maxGap, 1);

    const dotDeg = 0 + ratio * 180;
    const dot = arc(dotDeg);

    const arrowChar = current < target ? '↑ ' : '↓ ';

    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        }}>
            <Svg width={size} height={size * 0.5} viewBox={`0 0 ${size} ${size * 0.5}`}>
                <Defs>
                    <SvgLinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#D32F2F" />
                        <Stop offset="0.45" stopColor="#FBC02D" />
                        <Stop offset="1" stopColor="#F4A742" />
                    </SvgLinearGradient>
                </Defs>
                {/* Track */}
                <Path
                    d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`}
                    stroke="#E8E8E8"
                    strokeWidth={8}
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Progress */}
                <Path
                    d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${dot.x} ${dot.y}`}
                    stroke="url(#gaugeGrad)"
                    strokeWidth={8}
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Dot */}
                <Circle
                    cx={dot.x}
                    cy={dot.y}
                    r={8}
                    fill="#FF7F8A"
                    stroke="#FFF"
                    strokeWidth={2}
                />
            </Svg>
            <View style={gaugeS.center}>
                <View style={gaugeS.valueRow}>
                    <AppText style={gaugeS.arrowIcon}>{arrowChar}</AppText>
                    <AppText variant="semibold" style={gaugeS.gapText}>
                        {gap.toFixed(1)}
                    </AppText>

                    <AppText
                        variant="semibold"
                        style={{
                            fontSize: 16,
                            marginLeft: 4,
                            color: '#6E625B',
                            marginTop: 8,
                        }}
                    >
                        KG
                    </AppText>
                </View>
                <AppText variant="medium" style={gaugeS.goalText}>{WEIGHTTRACKERCONSTANTS.toReachGoal}</AppText>
            </View>
        </View>
    );
}

const gaugeS = StyleSheet.create({
    center: {
        position: 'absolute',
        top: 78,
        left: 0,
        right: 0,
        alignItems: 'center'
    },
    valueRow: { flexDirection: 'row', alignItems: 'center' },
    arrowIcon: { fontSize: 22, color: '#4CAF50', fontWeight: '700' },
    gapText: {
        fontSize: 34,
        color: '#5B4035'
    },
    goalText: { fontSize: 16, color: '#8B7D75', marginTop: 2 },
});
