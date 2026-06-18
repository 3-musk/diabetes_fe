import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAlert } from '../context/AlertContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, LoadingSpinner } from '../components';
import { ROUTES } from '../constants/routes';
import { subscriptionTexts } from '../constants/subscription';
import { useAuth } from '../context/AuthContext';
import { completeCart, createRazorpayOrder } from '../services/subscriptionService';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../theme';

type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const { accessToken, completeSubscription } = useAuth();
  const router = useRouter();
  const { alert } = useAlert();
  const insets = useSafeAreaInsets();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  const cartId = params.cartId as string;
  const planName = params.planName as string;
  const amount = parseInt(params.amount as string) || 0;

  const handleSimulatePayment = async () => {
    if (!accessToken || !cartId) {
      alert(subscriptionTexts.error, subscriptionTexts.invalidSession);
      router.back();
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      const paymentDetails = await createRazorpayOrder(accessToken, cartId, amount);
      
      const subscription = await completeCart(
        accessToken,
        cartId,
        'simulated_payment_' + Date.now(),
        paymentDetails.razorpayOrderId,
        'simulated_signature'
      );

      await completeSubscription();

      setPaymentStatus('success');
      
      setTimeout(() => {
        router.replace(ROUTES.appHome);
      }, 4000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      alert(subscriptionTexts.paymentFailed, subscriptionTexts.paymentFailedBody);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSimulatePayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setPaymentStatus('pending');
    handleSimulatePayment();
  };

  const handleGoBack = () => {
    router.back();
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'pending':
        return (
          <>
            <View style={styles.iconContainer}>
              <LoadingSpinner size="small" />
            </View>
            <AppText variant="bold" style={styles.title}>{subscriptionTexts.preparingPayment}</AppText>
            <AppText style={styles.subtitle}>{subscriptionTexts.preparingPaymentSubtitle}</AppText>
          </>
        );

      case 'processing':
        return (
          <>
            <View style={styles.iconContainer}>
              <LoadingSpinner size="small" />
            </View>
            <AppText variant="bold" style={styles.title}>{subscriptionTexts.processingPayment}</AppText>
            <AppText style={styles.subtitle}>{subscriptionTexts.processingPaymentSubtitle}</AppText>
            
            <View style={styles.orderSummary}>
              <AppText style={styles.orderLabel}>{subscriptionTexts.planLabel}</AppText>
              <AppText variant="semibold" style={styles.orderValue}>{planName}</AppText>
              <AppText style={styles.orderLabel}>{subscriptionTexts.amountLabel}</AppText>
              <AppText variant="bold" style={styles.orderAmount}>₹{amount}</AppText>
            </View>
          </>
        );

      case 'success':
        return (
          <>
            <View style={[styles.iconContainer, styles.successIcon]}>
              <AppText variant="bold" style={styles.successCheck}>✓</AppText>
            </View>
            <AppText variant="bold" style={styles.title}>{subscriptionTexts.paymentSuccessful}</AppText>
            <AppText style={styles.subtitle}>{subscriptionTexts.thankYouSubscribing}</AppText>
            
            <View style={styles.orderSummary}>
              <AppText style={styles.orderLabel}>{subscriptionTexts.planLabel}</AppText>
              <AppText variant="semibold" style={styles.orderValue}>{planName}</AppText>
              <AppText style={styles.orderLabel}>{subscriptionTexts.amountPaidLabel}</AppText>
              <AppText variant="bold" style={[styles.orderAmount, styles.successAmount]}>₹{amount}</AppText>
            </View>
            
            <AppText style={styles.redirectText}>{subscriptionTexts.redirectingDashboard}</AppText>
          </>
        );

      case 'failed':
        return (
          <>
            <View style={[styles.iconContainer, styles.failedIcon]}>
              <AppText variant="bold" style={styles.failedX}>✕</AppText>
            </View>
            <AppText variant="bold" style={styles.title}>{subscriptionTexts.paymentFailed}</AppText>
            <AppText style={styles.subtitle}>{subscriptionTexts.paymentFailedBody}</AppText>
            
            <View style={styles.buttonContainer}>
              <Button
                title={subscriptionTexts.tryAgainBtn}
                onPress={handleRetry}
                size="lg"
                style={styles.buttonFullWidth}
              />
              
              <Button
                title={subscriptionTexts.goBackBtn}
                onPress={handleGoBack}
                variant="outline"
                size="lg"
                style={styles.buttonFullWidth}
              />
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
      </View>

      {isProcessing && paymentStatus !== 'success' && (
        <View style={[styles.disclaimer, { bottom: insets.bottom + spacing.xxxxl }]}>
          <AppText style={styles.disclaimerText}>
            This is a simulated payment screen. In production, Razorpay payment gateway will be integrated here.
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    backgroundColor: colors.successLight,
  },
  failedIcon: {
    backgroundColor: colors.errorLight,
  },
  successCheck: {
    fontSize: 40,
    color: colors.success,
    fontWeight: fontWeight.bold,
  },
  failedX: {
    fontSize: 40,
    color: colors.error,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  orderSummary: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  orderValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  orderAmount: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  successAmount: {
    color: colors.success,
  },
  redirectText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.xl,
  },
  buttonFullWidth: {
    width: '100%',
    marginBottom: spacing.md,
  },
  disclaimer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    textAlign: 'center',
  },
});
