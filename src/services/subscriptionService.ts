import { apiClient } from '../utils/apiClient';

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
  variantId?: string;
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

// Get all available plans
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await apiClient.get('/api/ecommerce/products');
    const result = response.data;

    if (result.success && result.data?.products) {
      return result.data.products.map((prod: any) => {
        // Map duration label
        let durationLabel = '';
        if (prod.category === 'trial') {
          durationLabel = '7 days';
        } else if (prod.duration === 30) {
          durationLabel = 'per month';
        } else if (prod.duration === 360) {
          durationLabel = 'per year';
        } else {
          durationLabel = `per ${prod.duration} days`;
        }

        return {
          id: prod.productId,
          name: prod.title,
          price: prod.calculated_amount_with_tax,
          currency: 'INR',
          duration: durationLabel,
          durationInDays: prod.duration,
          features: prod.features || [],
          isPopular: prod.duration === 360 || (prod.category === 'membership' && prod.duration !== 7),
          isActive: true,
          variantId: prod.variantId,
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
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
