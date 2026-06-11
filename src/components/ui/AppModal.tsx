import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import React from 'react';
import {
  DimensionValue,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../theme';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayPress?: boolean;
  cardStyle?: ViewStyle;
  maxHeight?: DimensionValue;
  containerStyle?: ViewStyle;
}

export function AppModal({
  visible,
  onClose,
  children,
  closeOnOverlayPress = false,
  cardStyle,
  maxHeight = '85%',
  containerStyle,
}: AppModalProps) {

  const {height} = useWindowDimensions()
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* Absolute Backdrop Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.45)' }]}
          onPress={closeOnOverlayPress ? onClose : undefined}
        />
      </View>

      {/* Interactive/Keyboard Avoiding Layer */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        pointerEvents="box-none"
      >
        <View style={[styles.centeringContainer, {marginTop: height * 0.1}, containerStyle]} pointerEvents="box-none">
          <View style={[styles.container, { maxHeight }]}>
            {/* Close Button above the card */}
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <FontAwesome name="times" size={16} color={colors.textPrimary} />
            </Pressable>

            {/* Modal Card */}
            <Pressable
              style={[styles.card, cardStyle]}
              onPress={(e) => e.stopPropagation()}
            >
              {children}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  centeringContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl, // 32
    ...shadows.lg,
    overflow: 'hidden',
  },
});
