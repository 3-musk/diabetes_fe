import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { borderRadius, colors } from '../../theme';

interface BackButtonProps {
  onPress?: () => void;
  color?: string;
}

export function BackButton({ onPress, color = colors.primaryForeground }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable style={styles.backBtn} onPress={handlePress}>
      <FontAwesome name="arrow-left" size={15} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
