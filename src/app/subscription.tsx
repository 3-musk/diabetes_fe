import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, LoadingSpinner } from '../components';
import { useAuth } from '../context/AuthContext';
import { createSubscriptionCart, getPlans, Plan, SubscriptionCart } from '../services/subscriptionService';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../theme';

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
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan?.id === plan.id && styles.planCardSelected,
                plan.isPopular && styles.planCardPopular,
              ]}
              onPress={() => handleSelectPlan(plan)}
              activeOpacity={0.8}
            >
              {plan.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <Text style={[styles.planName, selectedPlan?.id === plan.id && styles.planNameSelected]}>
                  {plan.name}
                </Text>
                <View style={styles.priceContainer}>
                  <Text style={[styles.planPrice, selectedPlan?.id === plan.id && styles.planPriceSelected]}>
                    {formatPrice(plan.price)}
                  </Text>
                  <Text style={styles.planDuration}>{plan.duration}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Text style={[styles.checkmark, selectedPlan?.id === plan.id && styles.checkmarkSelected]}>✓</Text>
                    <Text style={[styles.featureText, selectedPlan?.id === plan.id && styles.featureTextSelected]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.selectIndicator}>
                <View style={[styles.radio, selectedPlan?.id === plan.id && styles.radioSelected]}>
                  {selectedPlan?.id === plan.id && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.selectText}>{selectedPlan?.id === plan.id ? 'Selected' : 'Select'}</Text>
              </View>
            </TouchableOpacity>
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
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  planCardPopular: {
    borderColor: colors.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.xl,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  popularBadgeText: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  planHeader: {
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  planNameSelected: {
    color: colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  planPriceSelected: {
    color: colors.primary,
  },
  planDuration: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkmark: {
    color: colors.success,
    fontSize: fontSize.lg,
    marginRight: spacing.md,
    fontWeight: fontWeight.bold,
  },
  checkmarkSelected: {
    color: colors.primary,
  },
  featureText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    flex: 1,
  },
  featureTextSelected: {
    color: colors.textPrimary,
  },
  selectIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  selectText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
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