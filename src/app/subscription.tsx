import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, LoadingSpinner, PlanCard } from '../components';
import { useAuth } from '../context/AuthContext';
import { createSubscriptionCart, getPlans, Plan, SubscriptionCart } from '../services/subscriptionService';
import { colors, fontSize, fontWeight, spacing } from '../theme';

export default function SubscriptionScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const fetchedPlans = await getPlans();
      setPlans(fetchedPlans);
    } catch (error) {
      Alert.alert('Error', 'Failed to load plans. Please try again.');
      console.error('Error loading plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a plan to continue');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'Please login again');
      return;
    }

    setIsProcessing(true);
    try {
      const cart: SubscriptionCart = await createSubscriptionCart(accessToken, selectedPlan.id);
      router.push({
        pathname: '/payment',
        params: {
          cartId: cart.id,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: selectedPlan.price.toString(),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create subscription cart. Please try again.');
      console.error('Error creating cart:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => `₹${price}`;

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading plans..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>Select a subscription plan that works best for you</Text>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              duration={plan.duration}
              features={plan.features}
              isPopular={plan.isPopular}
              isSelected={selectedPlan?.id === plan.id}
              onPress={() => handleSelectPlan(plan)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={selectedPlan ? `Continue to Payment - ${formatPrice(selectedPlan.price)}` : 'Select a Plan'}
          onPress={handleContinue}
          size="lg"
          disabled={!selectedPlan}
          loading={isProcessing}
        />
        <Text style={styles.termsText}>By subscribing, you agree to our Terms of Service and Privacy Policy.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  termsText: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});