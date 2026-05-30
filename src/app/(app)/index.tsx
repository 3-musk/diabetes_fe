import { getApp } from '@react-native-firebase/app';
import { crash, getCrashlytics, log, setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from "react-native";
import { Button } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { colors, fontSize, spacing } from '../../theme';

export default function Index() {
    const crashAnalytics = getCrashlytics()
    const { userPhoneNumber, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('Firebase App Name:', getApp().name);
        setCrashlyticsCollectionEnabled(crashAnalytics, true);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/login' as never);
    };

    const handleTestCrash = () => {
        log(crashAnalytics, "crash Button pressed");
        crash(crashAnalytics)
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Firebase is ready!</Text>
            <Text style={styles.phoneText}>Logged in as: {userPhoneNumber}</Text>

            <Button
                title="Test Crash"
                onPress={handleTestCrash}
                variant="outline"
                style={styles.button}
            />

            <Button
                title="Logout"
                onPress={handleLogout}
                variant="secondary"
                style={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    welcomeText: {
        fontSize: fontSize.xl,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    phoneText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.xxl,
    },
    button: {
        width: '100%',
        marginBottom: spacing.md,
    },
});