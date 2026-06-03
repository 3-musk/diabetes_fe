import { MoreTabIcon, SvgIcon } from '@/utils/icon';
import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoreMenuSheet } from '../../components/navigation/MoreMenuSheet';
import { colors, spacing } from '../../theme';

const tabIcons = {
    home: require('../../../assets/svgs/tabs/home.svg'),
    trends: require('../../../assets/svgs/tabs/trends.svg'),
    carePlan: require('../../../assets/svgs/tabs/carePlan.svg'),
    chat: require('../../../assets/svgs/tabs/chat.svg'),
};

export default function AppLayout() {
    const insets = useSafeAreaInsets();
    const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarStyle: {
                        display: 'flex',
                        height: 60 + insets.bottom,
                        paddingBottom: Math.max(insets.bottom, spacing.xs),
                        paddingTop: spacing.xs,
                        backgroundColor: colors.tabBackgroundColor
                    },
                    tabBarActiveTintColor: colors.tabButtonHighlightColor,
                    tabBarInactiveTintColor: colors.tabbuttonColor,
                    headerShown: false,
                }}
                initialRouteName="home"
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        tabBarLabel: 'Home',
                        tabBarIcon: ({ color }) => (
                            <SvgIcon source={tabIcons.home} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="trends"
                    options={{
                        title: 'Trends',
                        tabBarIcon: ({ color }) => (
                            <SvgIcon source={tabIcons.trends} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="care-plan"
                    options={{
                        title: 'Care Plan',
                        tabBarIcon: ({ color }) => (
                            <SvgIcon source={tabIcons.carePlan} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="chat"
                    options={{
                        title: 'Chat',
                        tabBarIcon: ({ color }) => (
                            <SvgIcon source={tabIcons.chat} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="more"
                    options={{
                        title: 'More',
                        tabBarButton: (props) => (
                            <Pressable
                                accessibilityRole={props.accessibilityRole}
                                accessibilityState={props.accessibilityState}
                                style={props.style}
                                onPress={() => setMoreMenuVisible(true)}
                            >
                                {props.children}
                            </Pressable>
                        ),
                        tabBarIcon: ({ color }) => (
                            <MoreTabIcon color={color} />
                        ),
                    }}
                />
                <Tabs.Screen name="profile" options={{ href: null }} />
                <Tabs.Screen name="settings" options={{ href: null }} />
            </Tabs>

            <MoreMenuSheet
                visible={isMoreMenuVisible}
                onClose={() => setMoreMenuVisible(false)}
            />
        </>
    );
}
