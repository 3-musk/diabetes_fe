import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  durationInDays: number;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
  amountPaid: number;
}

export interface SubscriptionCart {
  id: string;
  userId: string;
  planId: string;
  plan: Plan;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

export interface PaymentDetails {
  razorpayOrderId: string;
  amount: number;
  currency: string;
}

// Get all available plans (no auth required)
export const getPlans = async (): Promise<Plan[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // API: GET /api/subscriptions/plans

  return [
    {
      id: "monthly",
      name: "Monthly",
      price: 299,
      currency: "INR",
      duration: "per month",
      durationInDays: 30,
      features: [
        "Daily health tips",
        "Meal tracking",
        "Exercise suggestions",
        "Email support",
      ],
      isActive: true,
    },
    {
      id: "quarterly",
      name: "Quarterly",
      price: 799,
      currency: "INR",
      duration: "per 3 months",
      durationInDays: 90,
      features: [
        "Daily health tips",
        "Meal tracking",
        "Exercise suggestions",
        "Priority email support",
        "Monthly health report",
      ],
      isPopular: true,
      isActive: true,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: 2499,
      currency: "INR",
      duration: "per year",
      durationInDays: 365,
      features: [
        "Daily health tips",
        "Meal tracking",
        "Exercise suggestions",
        "24/7 phone support",
        "Quarterly health report",
        "Personalized diet plan",
        "Save 30%",
      ],
      isActive: true,
    },
  ];
};

// Get user's current subscription
export const getSubscription = async (
  accessToken: string,
): Promise<Subscription | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // API: GET /api/subscriptions/current
  // Headers: { Authorization: `Bearer ${accessToken}` }

  // For simulated testing:
  const localActive = await AsyncStorage.getItem("isSubscriptionActive");
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  return {
    id: "sub_demo",
    userId: "user_demo",
    planId: "monthly",
    planName: "Monthly Plan",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: "active",
    autoRenew: true,
    amountPaid: 299,
  };
};

// Create subscription cart (after selecting a plan)
export const createSubscriptionCart = async (
  accessToken: string,
  planId: string,
): Promise<SubscriptionCart> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // TODO: Replace with actual API call
  // API: POST /api/subscriptions/cart
  // Headers: { Authorization: `Bearer ${accessToken}` }
  // Body: { planId }

  const plans = await getPlans();
  const plan = plans.find((p) => p.id === planId);

  return {
    id: "cart_" + Date.now(),
    userId: "user_demo",
    planId: planId,
    plan: plan || plans[0],
    amount: plan?.price || 299,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
};

// Create Razorpay order for payment
export const createRazorpayOrder = async (
  accessToken: string,
  cartId: string,
  amount: number,
): Promise<PaymentDetails> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // TODO: Replace with actual API call
  // API: POST /api/payments/create-order
  // Headers: { Authorization: `Bearer ${accessToken}` }
  // Body: { cartId, amount }

  return {
    razorpayOrderId: "order_" + Date.now(),
    amount: amount * 100, // Razorpay expects amount in paise
    currency: "INR",
  };
};

// Complete cart payment (after Razorpay success)
export const completeCart = async (
  accessToken: string,
  cartId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string,
): Promise<Subscription> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // TODO: Replace with actual API call
  // API: POST /api/subscriptions/complete
  // Headers: { Authorization: `Bearer ${accessToken}` }
  // Body: { cartId, razorpayPaymentId, razorpayOrderId, razorpaySignature }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 365);

  return {
    id: "sub_" + Date.now(),
    userId: "user_demo",
    planId: cartId.replace("cart_", ""),
    planName: "Premium Plan",
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    status: "active",
    autoRenew: true,
    amountPaid: 299,
  };
};

// Cancel subscription
export const cancelSubscription = async (
  accessToken: string,
  subscriptionId: string,
): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // TODO: Replace with actual API call
  // API: DELETE /api/subscriptions/{subscriptionId}
  // Headers: { Authorization: `Bearer ${accessToken}` }

  return {
    success: true,
    message: "Subscription cancelled successfully",
  };
};

// Get subscription history
export const getSubscriptionHistory = async (
  accessToken: string,
): Promise<Subscription[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // API: GET /api/subscriptions/history
  // Headers: { Authorization: `Bearer ${accessToken}` }

  return [];
};
