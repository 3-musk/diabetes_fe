import { StyleSheet, View } from 'react-native';
import { colors, shadows, spacing } from '../../theme';
import AppText from '../ui/AppText';
import { BMI_SEGMENTS } from '../../constants/uiConstants';

interface BmiCardProps {
    bmi: number;
}

function BmiBar({ bmi }: { bmi: number }) {
    const segments = BMI_SEGMENTS;

    const min = 10;
    const max = 40;
    const pct = Math.max(0, Math.min(1, (bmi - min) / (max - min)));

    const getMarkerPosition = (bmi: number) => {
        let accumulatedWidth = 0;

        for (const segment of segments) {
            if (bmi <= segment.end) {
                const range = segment.end - segment.min;

                const progress =
                    range > 0
                        ? (bmi - segment.min) / range
                        : 0;

                return accumulatedWidth + progress * segment.width;
            }

            accumulatedWidth += segment.width;
        }

        return 100;
    };

    const markerPosition = getMarkerPosition(bmi);

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
                    BMI
                </AppText>

                <View style={{ alignItems: 'flex-end' }}>
                    <AppText
                        variant="semibold"
                        style={{
                            fontSize: 28,
                            color: '#111',
                        }}
                    >
                        {bmi}
                    </AppText>

                    <AppText
                        style={{
                            color: '#666',
                        }}
                    >
                        Normal Weight
                    </AppText>
                </View>
            </View>
            <BmiBar bmi={bmi} />
            <View style={s.bmiGrid}>
                <View style={s.bmiTypeCard}>
                    <View style={[s.dot, { backgroundColor: '#73BFE3' }]} />
                    <View>
                        <AppText>Underweight</AppText>
                        <AppText variant="semibold">{'<18.5'}</AppText>
                    </View>
                </View>

                <View style={s.bmiTypeCard}>
                    <View style={[s.dot, { backgroundColor: '#7ED987' }]} />
                    <View>
                        <AppText>Normal Weight</AppText>
                        <AppText variant="semibold">18.5 - 24.9</AppText>
                    </View>
                </View>

                <View style={s.bmiTypeCard}>
                    <View style={[s.dot, { backgroundColor: '#F1C54C' }]} />
                    <View>
                        <AppText>Overweight</AppText>
                        <AppText variant="semibold">25 - 29.9</AppText>
                    </View>
                </View>

                <View style={s.bmiTypeCard}>
                    <View style={[s.dot, { backgroundColor: '#F4A452' }]} />
                    <View>
                        <AppText>Obese Class I</AppText>
                        <AppText variant="semibold">30 - 34.9</AppText>
                    </View>
                </View>

                <View style={[s.bmiTypeCard, { width: '100%' }]}>
                    <View style={[s.dot, { backgroundColor: '#F27A7A' }]} />
                    <View>
                        <AppText>Obese Class II</AppText>
                        <AppText variant="semibold">35 and above</AppText>
                    </View>
                </View>
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
