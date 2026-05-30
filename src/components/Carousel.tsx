import { colors } from '@/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CarouselProps<T> {
    data: T[];
    renderItem: ({
        item,
        index,
    }: {
        item: T;
        index: number;
    }) => React.ReactElement;
    height?: number;
    showDots?: boolean;
    onIndexChange?: (index: number) => void;
    autoScroll?: boolean;
    autoScrollInterval?: number;
}

export function Carousel<T>({
    data,
    renderItem,
    height = 300,
    showDots = true,
    onIndexChange,
    autoScroll = false,
    autoScrollInterval = 3000,
}: CarouselProps<T>) {
    const [activeIndex, setActiveIndex] = useState(0);

    const flatListRef = useRef<FlatList<T>>(null);

    const handleScroll = (
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        const index = Math.round(
            event.nativeEvent.contentOffset.x / width
        );

        if (index !== activeIndex) {
            setActiveIndex(index);
            onIndexChange?.(index);
        }
    };

    useEffect(() => {
        if (!autoScroll || data.length <= 1) {
            return;
        }

        const timer = setInterval(() => {
            const nextIndex =
                activeIndex >= data.length - 1
                    ? 0
                    : activeIndex + 1;

            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });

            setActiveIndex(nextIndex);
            onIndexChange?.(nextIndex);
        }, autoScrollInterval);

        return () => clearInterval(timer);
    }, [
        activeIndex,
        autoScroll,
        autoScrollInterval,
        data.length,
        onIndexChange,
    ]);

    return (
        <View>
            <FlatList
                ref={flatListRef}
                data={data}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                onMomentumScrollEnd={handleScroll}
                renderItem={({ item, index }) => (
                    <View
                        style={{
                            width,
                            height,
                            paddingBottom: 20,
                        }}
                    >
                        {renderItem({ item, index })}
                    </View>
                )}
            />

            {showDots && (
                <View style={styles.pagination}>
                    {data.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === activeIndex &&
                                    styles.activeDot,
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    pagination: {
        position: 'absolute',
        bottom: 5,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#6B4B3E',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: colors.primaryForeground,
    },
});

export default Carousel;