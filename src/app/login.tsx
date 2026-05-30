import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Input, LoadingSpinner } from '../components';
import { useAuth } from '../context/AuthContext';
import { colors, fontSize, fontWeight, spacing } from '../theme';

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
            {/* Background Video */}
            <VideoView 
                player={player} 
                style={styles.absoluteFillObject} 
                contentFit="cover" 
            />

            {/* Overlay for better readability */}
            <View style={styles.overlay} />

            {/* Content */}
            <View style={styles.content}>
                {step === 'phone' ? (
                    <>
                        <Text style={styles.title}>Welcome</Text>
                        <Text style={styles.subtitle}>Enter your mobile number to continue</Text>

                        <View style={styles.inputContainer}>
                            <Input
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                containerStyle={styles.inputWrapper}
                            />
                        </View>

                        <Button
                            title="Send OTP"
                            onPress={handleSendOtp}
                            size="lg"
                            style={styles.button}
                        />
                    </>
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
                            <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
                                <Text style={styles.resendLink}>Resend OTP</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.changeNumberBtn} onPress={handleChangePhone}>
                            <Text style={styles.changeNumberText}>Change phone number</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        width: width,
        height: height,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    overlayContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // Optional: Adds a dark tint over the video so your white text/inputs are easier to read
        backgroundColor: 'rgba(0, 0, 0, 0.4)', 
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
        borderRadius: 12,
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
        backgroundColor: colors.primary,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
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
        alignItems: 'center',
    },
    changeNumberText: {
        color: colors.textLight,
        fontSize: fontSize.md,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});