import SegmentedControl from '@/components/SegmentedControl';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { registerTexts } from '../constants/registerTexts';
import { AppText, Button, Card, Checkbox, DateInput, Input, LoadingSpinner } from '../components';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';
import { colors, fontSize, spacing } from '../theme';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [yob, setYob] = useState(new Date());
    const [diagnosisYear, setdiagnosisYear] = useState(new Date());
    const [gender, setGender] = useState('male');
    const [email, setEmail] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [dataConsent, setDataConsent] = useState(false)
    const [aiConsent, setAiConsent] = useState(false)
    const [isLoading, setIsLoading] = useState(false);

    const { completeRegistration } = useAuth();

    const router = useRouter();

    const handleRegister = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            // Convert date to year string for submission
            const yearOfBirth = yob instanceof Date ? yob.getFullYear().toString() : yob;
            const registerReponse = await completeRegistration({ name, age: yearOfBirth });
            router.replace(ROUTES.subscription);
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
            <Card variant='primary' style={styles.content}>
                <AppText
                    variant='semibold'
                    style={{
                        fontSize: fontSize.xxl,
                        fontWeight: 'regular',
                        marginBottom: spacing.sm,
                        color: colors.textPrimary
                    }}
                >
                    {registerTexts.welcomeTitle}
                </AppText>

                <AppText 
                    variant='medium'
                    style={{
                        fontSize: fontSize.md,
                        color: colors.textSecondary,
                        marginBottom: spacing.xxxxl
                    }}
                >
                    {registerTexts.healthProfileSubtitle}
                </AppText>

                <View style={{
                    gap:12
                }}>
                    <Input
                        label={registerTexts.fullNameLabel}
                        placeholder={registerTexts.fullNamePlaceholder}
                        required
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <DateInput
                        label={registerTexts.yearOfBirthLabel}
                        value={yob}
                        onChange={(date) => setYob(date)}
                        required
                        mode="date"
                        display="spinner"
                        dateFormat="year"
                    />

                    <DateInput
                        label={registerTexts.diagnosisYearLabel}
                        value={diagnosisYear}
                        onChange={(date) => setdiagnosisYear(date)}
                        required
                        mode="date"
                        display="spinner"
                        dateFormat="year"
                    />

                    <View style={{flexDirection:'row', paddingBottom:4, justifyContent:'space-between', alignItems:'center', marginVertical:4}}>
                        <View style={{flexDirection:'row', paddingBottom:4}}>
                            <AppText style={styles.label} variant='medium'>
                                Gender
                            </AppText>
                            <AppText style={styles.required}>
                                *
                            </AppText>
                        </View>
                        <SegmentedControl 
                            value={gender}
                            options={['male', 'female']}
                            onChange={setGender}
                        />
                    </View>

                    <Input
                        label={registerTexts.emailAddressLabel}
                        placeholder={registerTexts.emailAddressPlaceholder}
                        required
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="words"
                    />

                    <Input
                        label={registerTexts.doctorReferralCodeLabel}
                        placeholder={registerTexts.doctorReferralCodePlaceholder}
                        required
                        value={referralCode}
                        onChangeText={setReferralCode}
                        autoCapitalize="words"
                    />

                    <AppText variant='bold' style={{fontSize: fontSize.lg, marginBottom: 30}}>
                        {registerTexts.consentAndPrivacyTitle}
                    </AppText>

                    <Checkbox 
                        checked={dataConsent}
                        onChange={setDataConsent}
                        titleStyle={styles.checkedTitle}
                        title={registerTexts.dataCollectionConsentTitle}
                        description={registerTexts.dataCollectionConsentDescription}
                    />

                    <Checkbox 
                        checked={aiConsent}
                        onChange={setAiConsent}
                        titleStyle={styles.checkedTitle}
                        title={registerTexts.aiAnalysisConsentTitle}
                        description={registerTexts.aiAnalysisConsentDescription}
                    />

                </View>

                <Button
                    title={registerTexts.completeSetupButton}
                    onPress={handleRegister}
                    size="lg"
                    style={styles.button}
                />
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: spacing.xl,
        justifyContent: 'center',
        paddingTop: height*0.05
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        maxWidth: 400,
        paddingTop: height*0.03,
        paddingLeft: width*0.05,
        paddingRight: width*0.05
    },
    button: {
        marginTop: spacing.md,
        marginBottom: spacing.xxl
    },
    label: {
        fontSize: fontSize.lg,
        color: colors.textPrimary,
    },
    required: {
        color: colors.error,
        marginLeft: 4,
        fontSize: fontSize.lg,
    },
    checkedTitle: {
        fontWeight: 'bold'
    }
});
