import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { completeCart, createRazorpayOrder } from '../services/subscriptionService';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const { accessToken, completeSubscription } = useAuth();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  const cartId = params.cartId as string;
  const planName = params.planName as string;
  const amount = parseInt(params.amount as string) || 0;

  useEffect(() => {
    // For demo: simulate successful payment after 2 seconds
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
      // Step 1: Create Razorpay order (simulated)
      const paymentDetails = await createRazorpayOrder(accessToken, cartId, amount);
      
      // Step 2: In production, here you would:
      // - Open Razorpay checkout with paymentDetails
      // - Handle payment success/failure callbacks
      
      // For demo, simulate successful payment
      const subscription = await completeCart(
        accessToken,
        cartId,
        'simulated_payment_' + Date.now(), // razorpayPaymentId
        paymentDetails.razorpayOrderId,
        'simulated_signature' // razorpaySignature
      );

      // Step 3: Update subscription status
      await completeSubscription();

      setPaymentStatus('success');
      
      // Navigate to dashboard after success
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {paymentStatus === 'pending' && (
          <>
            <View style={styles.iconContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
            <Text style={styles.title}>Preparing Payment...</Text>
            <Text style={styles.subtitle}>Please wait while we set up your payment</Text>
          </>
        )}

        {paymentStatus === 'processing' && (
          <>
            <View style={styles.iconContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
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
        )}

        {paymentStatus === 'success' && (
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
        )}

        {paymentStatus === 'failed' && (
          <>
            <View style={[styles.iconContainer, styles.failedIcon]}>
              <Text style={styles.failedX}>✕</Text>
            </View>
            <Text style={styles.title}>Payment Failed</Text>
            <Text style={styles.subtitle}>Something went wrong. Please try again.</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Text style={styles.backButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    backgroundColor: '#e8f5e9',
  },
  failedIcon: {
    backgroundColor: '#ffebee',
  },
  successCheck: {
    fontSize: 40,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  failedX: {
    fontSize: 40,
    color: '#f44336',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
  },
  orderValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  orderAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  successAmount: {
    color: '#4CAF50',
  },
  redirectText: {
    fontSize: 12,
    color: '#999',
    marginTop: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});