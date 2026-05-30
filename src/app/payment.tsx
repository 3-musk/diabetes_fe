import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, LoadingSpinner } from '../components';
import { useAuth } from '../context/AuthContext';
import { completeCart, createRazorpayOrder } from '../services/subscriptionService';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../theme';

type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const { accessToken, completeSubscription } = useAuth();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

  const cartId = params.cartId as string;
  const planName = params.planName as string;
  const amount = parseInt(params.amount as string) || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSimulatePayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSimulatePayment = async () => {
    if (!accessToken || !cartId) {
      Alert.alert('Error', 'Invalid payment session. Please try again.');
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
        router.replace('/(app)');
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
            <Text style={styles.title}>Preparing Payment...</Text>
            <Text style={styles.subtitle}>Please wait while we set up your payment</Text>
          </>
        );

      case 'processing':
        return (
          <>
            <View style={styles.iconContainer}>
              <LoadingSpinner size="small" />
            </View>
            <Text style={styles.title}>Processing Payment</Text>
            <Text style={styles.subtitle}>Please do not close this screen</Text>
            
            <View style={styles.orderSummary}>
              <Text style={styles.orderLabel}>Plan</Text>
              <Text style={styles.orderValue}>{planName}</Text>
              <Text style={styles.orderLabel}>Amount</Text>
              <Text style={styles.orderAmount}>₹{amount}</Text>
            </View>
          </>
        );

      case 'success':
        return (
          <>
            <View style={[styles.iconContainer, styles.successIcon]}>
              <Text style={styles.successCheck}>✓</Text>
            </View>
            <Text style={styles.title}>Payment Successful!</Text>
            <Text style={styles.subtitle}>Thank you for subscribing</Text>
            
            <View style={styles.orderSummary}>
              <Text style={styles.orderLabel}>Plan</Text>
              <Text style={styles.orderValue}>{planName}</Text>
              <Text style={styles.orderLabel}>Amount Paid</Text>
              <Text style={[styles.orderAmount, styles.successAmount]}>₹{amount}</Text>
            </View>
            
            <Text style={styles.redirectText}>Redirecting to dashboard...</Text>
          </>
        );

      case 'failed':
        return (
          <>
            <View style={[styles.iconContainer, styles.failedIcon]}>
              <Text style={styles.failedX}>✕</Text>
            </View>
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.subtitle}>Something went wrong. Please try again.</Text>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Try Again"
                onPress={handleRetry}
                size="lg"
                style={styles.buttonFullWidth}
              />
              
              <Button
                title="Go Back"
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
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This is a simulated payment screen. In production, Razorpay payment gateway will be integrated here.
          </Text>
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
    bottom: spacing.xxxxl,
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