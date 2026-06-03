import { loginTexts } from '@/assets/data/loginTexts';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { OtpInput } from "react-native-otp-entry";
import { AppText, Button, Carousel, LoadingSpinner, PhoneInput } from '../components';
import { ROUTES } from '../constants/routes';
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
                router.replace(ROUTES.register);
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

    const player = useVideoPlayer(require('../../assets/video/login/gb_video.mp4'), player => {
        player.loop = true;
        player.play();
    });

    if (isLoading && step === 'phone') {
        return <LoadingSpinner fullScreen text="Sending OTP..." />;
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                {step === 'phone' ? (
                    <>
                        <VideoView
                            player={player}
                            style={styles.absoluteFillObject}
                            contentFit="cover"
                            nativeControls={false}
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

                        <KeyboardAvoidingView 
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                            style={styles.keyboardWrapper}
                        >
                            <View style={styles.phoneNumberContent}>
                                <Carousel
                                    data={loginTexts.carouselTitles}
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
                                            <AppText style={styles.carouselText}>
                                                {item.title}
                                            </AppText>
                                        </View>
                                    )}
                                />
                                <PhoneInput
                                    placeholder="Enter Phone Number"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    countryCode='+91'
                                    containerStyle={styles.input}
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
                        </KeyboardAvoidingView>
                    </>
                ) : (
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                        style={styles.keyboardWrapper}
                    >
                        <View style={styles.otpInputContainer}>
                            <View style={styles.otpInputCard}>
                                <View style={{flexDirection:'row'}}>
                                    <Button
                                        onPress={handleChangePhone}
                                        variant='secondary'
                                        style={{paddingVertical: spacing.lg}}
                                    >
                                        <FontAwesome name="arrow-left" size={15} color={colors.secondaryForeground} />
                                    </Button>
                                </View>
                                <View style={{flexDirection:'column', alignItems:'flex-start', marginTop:16}}>
                                    <AppText style={styles.title}>
                                        {loginTexts.enterOtpTitle}
                                    </AppText>
                                    <AppText style={styles.subtitle}>
                                        We have sent the code to +91{phoneNumber}
                                    </AppText>
                                </View>

                                <OtpInput
                                    numberOfDigits={6}
                                    onTextChange={setOtp}
                                    focusColor={colors.primary}
                                    theme={{
                                        pinCodeContainerStyle: {
                                            width: 45,
                                            height: 75,
                                            borderRadius: 22,
                                            borderWidth: 1,
                                            borderColor: '#E3E3E3',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        },
                                        containerStyle: {
                                            width: 'auto',
                                            marginVertical: 20
                                        }
                                    }}
                                />

                                <View style={styles.resendContainer}>
                                    <AppText style={styles.resendText}>Didn't receive the verification code? </AppText>
                                    <Button
                                        title="Resend"
                                        onPress={handleResendOtp}
                                        variant="ghost"
                                        disabled={isLoading}
                                        textStyle={styles.resendLink}
                                        style={{paddingHorizontal: spacing.xs}}
                                    />
                                </View>

                                <Button
                                    title="Verify"
                                    onPress={handleVerifyOtp}
                                    size="lg"
                                    loading={isLoading}
                                    style={styles.button}
                                    icon={
                                        <FontAwesome name="arrow-right" size={15} color={colors.primaryForeground} />
                                    }
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    keyboardWrapper: {
        flex: 1,
    },
    phoneNumberContent: {
        flex: 1,
        flexDirection: 'column',
        gap: height * 0.02,
        justifyContent: 'flex-end',
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.15,
    },
    carouselText: {
        color: '#d0cdcd',
        textAlign: 'center',
        fontSize: 28,
        lineHeight: 36,
        fontWeight: '400',
    },
    otpInputContainer: {
        flex: 1, // Switched to flex: 1 to fill the screen properly
        // flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: height * 0.1,
        paddingHorizontal: width * 0.05,
    },
    otpInputCard: {
        padding: width * 0.05,
        borderRadius: borderRadius.lg,
        flexDirection: 'column',
        backgroundColor: colors.primaryBackground,
        width: '100%', // Ensure it takes available width
        maxWidth: 400, // Keeps it from getting too wide on tablets
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,

        elevation: 5,
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
    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.regular,
        marginBottom: spacing.sm,
        color: colors.secondaryForeground,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.secondaryForeground,
        marginBottom: spacing.xxl,
        textAlign: 'center',
        lineHeight: 15
    },
    input: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center', // Centers it if the screen is wider than 400
    },
    button: {
        width: '100%',
        maxWidth: 400,
        marginTop: spacing.sm,
        alignSelf: 'center', // Centers it if the screen is wider than 400
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.lg
    },
    resendText: {
        color: colors.secondaryForeground,
        fontSize: fontSize.md
    },
    resendLink: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
