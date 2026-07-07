import { StyleSheet, View } from 'react-native';
import { colors, shadows, spacing } from '../../theme';
import AppText from '../ui/AppText';
import { BMI_SEGMENTS } from '../../constants/uiConstants';
import { weightTracker as WEIGHTTRACKERCONSTANTS } from '../../constants/weightTracker';

import { BmiData } from '../../services/trackerService';

interface BmiCardProps {
    bmi: BmiData;
}

const CATEGORY_COLORS = ['#73BFE3', '#7ED987', '#F1C54C', '#F4A452', '#F27A7A'];

function BmiBar({ bmi }: { bmi: BmiData }) {
    const segments = bmi.categories.map((c, i) => {
        let label = c.min.toString();
        if (i === 0) label = "0";
        if (i === bmi.categories.length - 1) label = c.min.toString() + "+";
        
        return {
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
            label,
            min: c.min,
            end: c.max,
            width: 100 / bmi.categories.length
        };
    });

    const val = bmi.value;

    const getMarkerPosition = (val: number) => {
        let accumulatedWidth = 0;

        for (const segment of segments) {
            if (val <= segment.end) {
                const range = segment.end - segment.min;
                const progress = range > 0 ? (val - segment.min) / range : 0;
                return Math.min(100, Math.max(0, accumulatedWidth + progress * segment.width));
            }
            accumulatedWidth += segment.width;
        }

        return 100;
    };

    const markerPosition = getMarkerPosition(val);

    return (
        <View>
            <View style={bmiS.markerContainer}>
                <View
                    style={[
                        bmiS.markerWrapper,
                        { left: `${markerPosition}%` as any },
                    ]}
                >
                    <View style={bmiS.markerDot} />
                    <View style={bmiS.markerTriangle} />
                </View>
            </View>

            <View style={bmiS.barRow}>
                {segments.map((s, i) => (
                    <View
                        key={i}
                        style={[
                            bmiS.segment,
                            {
                                flex: s.width,
                                backgroundColor: s.color,
                            },
                        ]}
                    />
                ))}
            </View>

            <View style={bmiS.labelRow}>
                {segments.map((s, i) => (
                    <AppText key={i} style={bmiS.barLabel}>
                        {s.label}
                    </AppText>
                ))}
            </View>
        </View>
    );
}

const bmiS = StyleSheet.create({
    markerContainer: {
        height: 24,
        position: 'relative',
    },

    markerWrapper: {
        position: 'absolute',
        transform: [{ translateX: -9 }],
        alignItems: 'center',
        justifyContent: 'center',
    width: 18,
    },

    markerDot: {
        width: 18,
        height: 18,
        borderRadius: 99,
        backgroundColor: '#7ED987',
    },

    markerTriangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#7ED987',
        marginTop: -2,
    },

    barRow: {
        flexDirection: 'row',
        gap: 4,
    },

    segment: {
        height: 10,
        borderRadius: 8,
    },

    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },

    barLabel: {
        fontSize: 11,
        color: '#555',
    },
});

export function BmiCard({ bmi }: BmiCardProps) {
    return (
        <View style={s.bmiCard}>
            <View style={s.bmiHeader}>
                <AppText variant="medium" style={s.bmiTitle}>
                    {WEIGHTTRACKERCONSTANTS.bmiTitle}
                </AppText>

                <View style={{ alignItems: 'flex-end' }}>
                    <AppText
                        variant="semibold"
                        style={{
                            fontSize: 28,
                            color: '#111',
                        }}
                    >
                        {bmi.value}
                    </AppText>

                    <AppText
                        style={{
                            color: '#666',
                        }}
                    >
                        {bmi.categoryLabel}
                    </AppText>
                </View>
            </View>
            <BmiBar bmi={bmi} />
            <View style={s.bmiGrid}>
                {bmi.categories.map((cat, i) => (
                    <View key={i} style={[s.bmiTypeCard, i === bmi.categories.length - 1 ? { width: '100%' } : {}]}>
                        <View style={[s.dot, { backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }]} />
                        <View>
                            <AppText>{cat.label}</AppText>
                            <AppText variant="semibold">
                                {i === bmi.categories.length - 1 ? `${cat.min} and above` : 
                                 i === 0 ? `<${cat.max}` : `${cat.min} - ${cat.max}`}
                            </AppText>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    bmiCard: {
        backgroundColor: '#FFF', borderRadius: 24,
        padding: spacing.xl, marginBottom: spacing.lg,
        borderWidth: 1, borderColor: '#F5DAAA',
        ...shadows.sm,
    },
    bmiHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg, alignItems: 'center' },
    bmiTitle: { fontSize: 18, color: colors.textPrimary },
    bmiSub: { fontSize: 12, color: colors.textSecondary },
    bmiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 24,
    },
    bmiTypeCard: {
        width: '48%',
        backgroundColor: '#F5F2EA',
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
