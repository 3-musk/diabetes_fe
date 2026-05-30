import { getApp } from '@react-native-firebase/app';
import { crash, getCrashlytics, log, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from '../../context/AuthContext';

export default function Index() {
    const crashAnalytics = getCrashlytics()
    const { userPhoneNumber, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('Firebase App Name:', getApp().name);

        // Force Crashlytics to track crashes even in local dev mode
        setCrashlyticsCollectionEnabled(crashAnalytics, true);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as never);
    };

    return (
        <View style={styles.container}>
            <Text>Firebase is ready!</Text>
            <Text style={styles.phoneText}>Logged in as: {userPhoneNumber}</Text>

            {/* Test Crash Button */}
            <Button
                title="Test Crash"
                color="red"
                onPress={() => {
                    log(crashAnalytics, "crash Button pressed");
                    crash(crashAnalytics)
                }
                }
            />

            {/* Logout Button */}
            <Button
                title="Logout"
                color="orange"
                onPress={handleLogout}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    phoneText: {
        marginVertical: 10,
        fontSize: 14,
        color: '#666',
    },
});