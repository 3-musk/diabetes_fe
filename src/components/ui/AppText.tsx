import {
    Text as RNText,
    StyleSheet,
    TextProps,
} from 'react-native';

type Variant =
    | 'regular'
    | 'medium'
    | 'semibold'
    | 'bold';

interface AppTextProps extends TextProps {
    variant?: Variant;
}

export default function AppText({
    variant = 'regular',
    style,
    children,
    ...props
}: AppTextProps) {
    return (
        <RNText
            {...props}
            style={[
                styles[variant],
                style,
            ]}
        >
            {children}
        </RNText>
    );
}

const styles = StyleSheet.create({
    regular: {
        fontFamily: 'Chillax-Regular',
    },
    medium: {
        fontFamily: 'Chillax-Medium',
    },
    semibold: {
        fontFamily: 'Chillax-Semibold',
    },
    bold: {
        fontFamily: 'Chillax-Bold',
    },
});