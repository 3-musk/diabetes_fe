import { slides } from '@/assets/login/data';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { Button, Carousel, Input, LoadingSpinner, PhoneInput } from '../components';
import { useAuth } from '../context/AuthContext';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../theme';
const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);
    const { login, verifyOtp, resendOtp } = useAuth();
    const router = useRouter();

    const handleSendOtp = async () => {
        if (!phoneNumber.trim()) {
            Alert.alert('Error', 'Please enter a phone number');
            return;
        }

        const phoneDigits = phoneNumber.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number (at least 10 digits)');
            return;
        }

        setIsLoading(true);
        try {
            await login(phoneNumber);
            setStep('otp');
        } catch (error) {
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim() || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            const isValid = await verifyOtp(otp);
            if (isValid) {
                router.replace('/register');
            } else {
                Alert.alert('Error', 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to verify OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setOtp('');
        try {
            await resendOtp();
            Alert.alert('Success', 'OTP has been resent to your phone');
        } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        }
    };

    const handleChangePhone = () => {
        setStep('phone');
        setOtp('');
    };

    const player = useVideoPlayer(require('../../assets/login/gb_video.mp4'), player => {
        player.loop = true;
        player.play();
    });

    if (isLoading && step === 'phone') {
        return <LoadingSpinner fullScreen text="Sending OTP..." />;
    }

    return (
        <View style={styles.container}>
            {step === 'phone' ? (
                <View style={styles.phoneNumberPageContainer}>
                    <VideoView
                        player={player}
                        style={styles.absoluteFillObject}
                        contentFit="cover"
                    />
                    <LinearGradient
                        colors={[
                            'transparent',
                            'transparent',
                            'rgba(80,54,41,0.5)',
                            'rgba(80,54,41,0.9)',
                        ]}
                        locations={[0, 0.5, 0.75, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.overlay}
                    />

                    <Carousel
                        data={slides}
                        height={180}
                        autoScroll
                        autoScrollInterval={5000}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    paddingHorizontal: 32,
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#d0cdcd',
                                        textAlign: 'center',
                                        fontSize: 28,
                                        lineHeight: 36,
                                        fontWeight: 400,
                                    }}
                                >
                                    {item.title}
                                </Text>
                            </View>
                        )}
                    />

                    <View style={styles.phoneNumberSectionContainer}>
                        <PhoneInput
                            placeholder="Enter Phone Number"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            countryCode='+91'
                        // containerStyle={styles.inputWrapper}
                        />

                        <Button
                            title="Send verification code"
                            onPress={handleSendOtp}
                            size="lg"
                            style={styles.button}
                            icon={
                                <FontAwesome name="arrow-right" size={15} color={colors.primaryForeground} />
                            }
                        />
                    </View>
                </View>
            ) : (
                <>
                    <Text style={styles.title}>Verify OTP</Text>
                    <Text style={styles.subtitle}>
                        We sent a code to{'\n'}+91 {phoneNumber}
                    </Text>

                    <View style={styles.inputContainer}>
                        <Input
                            placeholder="Enter 6-digit OTP"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                            style={styles.otpInput}
                            containerStyle={styles.inputWrapper}
                        />
                    </View>

                    <Button
                        title="Verify & Continue"
                        onPress={handleVerifyOtp}
                        size="lg"
                        loading={isLoading}
                        style={styles.button}
                    />

                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        <Button
                            title="Resend OTP"
                            onPress={handleResendOtp}
                            variant="ghost"
                            disabled={isLoading}
                            textStyle={styles.resendLink}
                        />
                    </View>

                    <Button
                        title="Change phone number"
                        onPress={handleChangePhone}
                        variant="ghost"
                        style={styles.changeNumberBtn}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    phoneNumberPageContainer: {
        flexDirection: 'column',
        gap: height * 0.05,
        justifyContent: 'flex-end',
        height: '100%',
        paddingBottom: height * 0.15
    },
    phoneNumberSectionContainer: {
        flexDirection: 'column',
        gap: height * 0.02,
        paddingHorizontal: width * 0.05
    },
    absoluteFillObject: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#50362900'
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        position: 'relative',
        zIndex: 1,
    },
    title: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
        color: colors.textLight,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textLight,
        marginBottom: spacing.xxl,
        textAlign: 'center',
        lineHeight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    inputContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.md,
    },
    inputWrapper: {
        marginBottom: 0,
    },
    otpInput: {
        textAlign: 'center',
        letterSpacing: spacing.sm,
        fontSize: fontSize.xxl,
    },
    button: {
        width: '100%',
        maxWidth: 400,
        marginTop: spacing.sm,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    resendText: {
        color: colors.textLight,
        fontSize: fontSize.md,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    resendLink: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    changeNumberBtn: {
        marginTop: spacing.lg,
    },
});