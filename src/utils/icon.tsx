import { Image, ImageSource } from 'expo-image';
import { ColorValue, StyleSheet, View } from 'react-native';

export function SvgIcon({ source, color, size = 24 }: { source: ImageSource; color?: ColorValue; size?: number }) {
    return (
        <Image
            source={source}
            tintColor={color && color as string}
            contentFit="contain"
            style={{ width: size, height: size }}
        />
    );
}

export function MoreTabIcon({ color }: { color: ColorValue }) {
    return (
        <View style={styles.moreIcon}>
            {[0, 1, 2].map((index) => (
                <Image
                    key={index}
                    source={require('../../assets/svgs/tabs/more.svg')}
                    tintColor={color && color as string}
                    contentFit="contain"
                    style={styles.moreIconDot}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    moreIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        width: 24,
        height: 24,
        justifyContent: 'center',
    },
    moreIconDot: {
        width: 5,
        height: 5,
    },
});
