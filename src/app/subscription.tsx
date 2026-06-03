import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { subscriptionTexts } from '../../assets/data/subscriptionTexts';

import {
  AppText,
  Button,
  LoadingSpinner,
  PlanCard,
} from '../components';

import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

import {
  createSubscriptionCart,
  getPlans,
  Plan,
  SubscriptionCart,
} from '../services/subscriptionService';

import {
  borderRadius,
  colors,
  fontSize,
  spacing,
} from '../theme';

export default function SubscriptionScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { accessToken, isFirstTimeUser, setHasDismissedSubscription } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadPlans = async () => {
    try {
      const fetchedPlans = await getPlans();
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0) {
        setSelectedPlan(fetchedPlans[0]);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load subscription plans'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleContinue = async () => {
    if (!selectedPlan) {
      Alert.alert(
        'Error',
        'Please select a plan'
      );
      return;
    }

    if (!accessToken) {
      Alert.alert(
        'Error',
        'Please login again'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const cart: SubscriptionCart = await createSubscriptionCart(
        accessToken,
        selectedPlan.id
      );

      router.push({
        pathname: ROUTES.payment,
        params: {
          cartId: cart.id,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: selectedPlan.price.toString(),
        },
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create subscription'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setHasDismissedSubscription(true);
    router.replace(ROUTES.appHome);
  };

  if (isLoading) {
    return (
      <LoadingSpinner
        fullScreen
        text="Loading plans..."
      />
    );
  }

  return (
    <View style={styles.container}>
      {isFirstTimeUser === false && (
        <Pressable
          style={[styles.closeButton, { top: insets.top + spacing.sm }]}
          onPress={handleClose}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <FontAwesome name="times" size={20} color={colors.textPrimary} />
        </Pressable>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* HERO IMAGE */}
        <View style={styles.heroContainer}>
          <Image
            source={require('../../assets/images/subscription/hero.png')}
            resizeMode="contain"
            style={styles.heroImage}
          />
        </View>

        {/* MAIN CARD */}
        <View style={styles.cardContainer}>
          <AppText
            variant="bold"
            style={styles.heading}
          >
            {subscriptionTexts.takeControlOfYourHealth}
          </AppText>

          <View style={styles.planContainer}>
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                price={plan.price}
                duration={plan.duration}
                features={plan.features}
                isSelected={selectedPlan?.id === plan.id}
                onPress={() => setSelectedPlan(plan)}
              />
            ))}
          </View>

          <AppText style={styles.infoText}>
            {subscriptionTexts.infoText}
          </AppText>

          <View style={styles.switchContainer}>
            <AppText
              style={styles.switchText}
            >
              {subscriptionTexts.reminderText}
            </AppText>

            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{
                false: '#DDD',
                true: colors.primary,
              }}
              thumbColor="#FFF"
            />
          </View>

          <Button
            title={subscriptionTexts.proceedButton}
            onPress={handleContinue}
            loading={isProcessing}
            size="lg"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondarybackground,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  heroImage: {
    width: 250,
    height: 250,
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxxl,
    marginHorizontal: spacing.lg,
  },
  heading: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.xxxl,
    lineHeight: 34,
  },
  planContainer: {
    marginBottom: spacing.lg,
  },
  infoText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondarybackground,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xxxl,
  },
  switchText: {
    flex: 1,
    marginRight: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.sm,
  },
  button: {
    width: '100%',
  },
});
