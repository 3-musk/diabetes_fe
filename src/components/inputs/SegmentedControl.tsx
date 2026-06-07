import {
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    borderRadius,
    colors,
    fontSize,
    fontWeight,
    spacing,
} from '../../theme';
import AppText from '../ui/AppText';

interface SegmentedControlProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

export default function SegmentedControl({
    value,
    options,
    onChange,
}: SegmentedControlProps) {
    return (
        <View style={styles.container}>
            {options.map(option => {
                const active = option === value;

                return (
                    <TouchableOpacity
                        key={option}
                        activeOpacity={0.8}
                        style={[
                            styles.option,
                            active && styles.activeOption,
                        ]}
                        onPress={() => onChange(option)}
                    >
                        <AppText
                            style={[
                                styles.text,
                                active && styles.activeText,
                            ]}
                        >
                            {option[0].toUpperCase() + option.slice(1)}
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: '#F5F1E8',
        borderRadius: borderRadius.full,
        padding: 0,
    },
    option: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
    },
    activeOption: {
        backgroundColor: '#F6D57A',
    },
    text: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    activeText: {
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },
});
