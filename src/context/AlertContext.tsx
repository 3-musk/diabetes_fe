import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { borderRadius, colors, fontSize, shadows, spacing } from '../theme';
import AppText from '../components/ui/AppText';
import Button from '../components/ui/Button';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertOptions {
  cancelable?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  options?: AlertOptions;
}

interface AlertContextType {
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: '',
  });

  const { width } = useWindowDimensions();

  const alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => {
    setState({
      visible: true,
      title,
      message,
      buttons,
      options,
    });
  };

  const handleClose = () => {
    setState((prev) => ({ ...prev, visible: false }));
  };

  const handleButtonPress = (btn: AlertButton) => {
    handleClose();
    if (btn.onPress) {
      // Small timeout to let modal close transition finish
      setTimeout(() => {
        btn.onPress?.();
      }, 100);
    }
  };

  // Determine status color & icon based on title/message context or explicit type
  const getType = (): 'info' | 'success' | 'warning' | 'error' => {
    if (state.options?.type) return state.options.type;
    const lowerTitle = state.title.toLowerCase();
    const lowerMsg = (state.message || '').toLowerCase();
    if (lowerTitle.includes('error') || lowerTitle.includes('failed') || lowerMsg.includes('error') || lowerMsg.includes('failed')) {
      return 'error';
    }
    if (lowerTitle.includes('success') || lowerTitle.includes('complete') || lowerMsg.includes('success')) {
      return 'success';
    }
    if (lowerTitle.includes('warning') || lowerTitle.includes('attention') || lowerTitle.includes('confirm') || lowerTitle.includes('delete')) {
      return 'warning';
    }
    return 'info';
  };

  const alertType = getType();

  const getIconConfig = () => {
    switch (alertType) {
      case 'success':
        return { name: 'check-circle' as const, color: colors.success, bg: colors.successLight };
      case 'error':
        return { name: 'times-circle' as const, color: colors.error, bg: colors.errorLight };
      case 'warning':
        return { name: 'exclamation-triangle' as const, color: colors.warning, bg: colors.warningLight };
      default:
        return { name: 'info-circle' as const, color: colors.primary, bg: '#FE6A3515' };
    }
  };

  const iconConfig = getIconConfig();

  const getTypeColor = () => {
    switch (alertType) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const typeColor = getTypeColor();

  // If no buttons are provided, show a default "OK" button
  const renderedButtons = state.buttons && state.buttons.length > 0
    ? state.buttons
    : [{ text: 'OK', style: 'default' as const }];

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        onRequestClose={state.options?.cancelable ? handleClose : undefined}
        statusBarTranslucent={true}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={state.options?.cancelable ? handleClose : undefined}
          />
          <View
            style={[
              styles.card,
              {
                width: Math.min(width * 0.85, 340),
                borderTopWidth: 6,
                borderTopColor: typeColor,
              },
            ]}
          >
            {/* Header Icon */}
            <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
              <FontAwesome name={iconConfig.name} size={32} color={iconConfig.color} />
            </View>

            {/* Alert Content */}
            <AppText variant="semibold" style={styles.title}>
              {state.title}
            </AppText>

            {state.message ? (
              <AppText variant="regular" style={styles.message}>
                {state.message}
              </AppText>
            ) : null}

            {/* Button Actions */}
            <View
              style={[
                styles.buttonContainer,
                renderedButtons.length > 2 ? styles.buttonContainerVertical : styles.buttonContainerHorizontal,
              ]}
            >
              {renderedButtons.map((btn, idx) => {
                let variant: 'primary' | 'outline' | 'ghost' = 'primary';
                let customStyle = {};

                if (btn.style === 'cancel') {
                  variant = 'outline';
                } else if (btn.style === 'destructive') {
                  customStyle = { backgroundColor: colors.error, borderColor: colors.error };
                } else {
                  customStyle = { backgroundColor: typeColor, borderColor: typeColor };
                }

                return (
                  <Button
                    key={idx}
                    variant={variant}
                    title={btn.text}
                    style={{ ...styles.btn, ...customStyle }}
                    textStyle={btn.style === 'destructive' ? { color: '#FFFFFF' } : undefined}
                    onPress={() => handleButtonPress(btn)}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
export default useAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl + 4, // 20
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  buttonContainerHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
  },
  btn: {
    flex: 1,
    minWidth: 100,
  },
});
