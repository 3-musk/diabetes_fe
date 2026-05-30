import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { Button, Input, LoadingSpinner } from '../components';
import { colors, spacing, fontSize, fontWeight } from '../theme';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { completeRegistration } = useAuth();

    const router = useRouter();

    const handleRegister = async () => {
        if (!name.trim() || !age.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await completeRegistration({ name, age });
            console.log()
            router.replace('/subscription');
        } catch (error) {
            Alert.alert('Error', 'Failed to save registration details.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner fullScreen text="Creating your profile..." />;
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.content}>
                <Text style={styles.title}>Complete Profile</Text>
                <Text style={styles.subtitle}>Help us personalize your experience</Text>

                <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

                <Input
                    label="Age"
                    placeholder="e.g. 25"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                />

                <Button
                    title="Continue"
                    onPress={handleRegister}
                    size="lg"
                    style={styles.button}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.xxxxl,
        textAlign: 'center',
    },
    button: {
        marginTop: spacing.md,
    },
});