import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export function useFeatureAccess() {
  const { user, isSubscriptionActive } = useAuth();

  const checkFeature = (featureName: string, action: () => void) => {
    const features = user?.subscriptionFeatures || [];
    
    if (features.includes(featureName)) {
      action();
    } else {
      if (isSubscriptionActive) {
        Alert.alert(
          'Feature Unavailable',
          'This feature is not available for your subscription plan.'
        );
      } else {
        Alert.alert(
          'Subscription Required',
          'Please purchase a subscription to use this feature.'
        );
      }
    }
  };

  return { checkFeature };
}
