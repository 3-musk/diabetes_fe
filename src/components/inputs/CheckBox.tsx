import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import {
    StyleSheet,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '../../theme';
import AppText from '../ui/AppText';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    title?: string;
    description?: string;
    labelStyle?: TextStyle;
    labelCheckedStyle?: TextStyle;
    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    containerStyle?: ViewStyle;
}

export default function Checkbox({
    checked,
    onChange,
    title,
    description,
    labelStyle,
    labelCheckedStyle,
    titleStyle,
    descriptionStyle,
    containerStyle
}: CheckboxProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.container, containerStyle]}
            onPress={() => onChange(!checked)}
        >
            <View
                style={[
                    styles.checkbox,
                    checked && styles.checkboxChecked,
                ]}
            >
                {checked && <FontAwesome name="check" size={14} color={colors.primaryBackground} />}
            </View>

            {title ? (
                <View style={styles.content}>
                    <AppText style={[styles.title, titleStyle]}>{title}</AppText>

                    {description && (
                        <AppText style={styles.description}>
                            {description}
                        </AppText>
                    )}
                </View>
            ) : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#DADADA',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    innerCheck: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFF',
    },
    content: {
        flex: 1,
        marginLeft: spacing.md,
    },
    title: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    description: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});