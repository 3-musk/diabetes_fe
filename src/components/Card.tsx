import React from 'react';
import { View, ViewStyle } from 'react-native';
import { borderRadius, colors } from '../theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
  elevated?: boolean;
  variant?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'none',
}) => {

  const getButtonStyle = (): ViewStyle => {

    switch (variant) {
      case 'primary':
        return {
          
          backgroundColor: colors.primaryBackground,
          borderRadius: borderRadius.xxl
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondarybackground,
          borderRadius: borderRadius.xxl
        };
      default:
        return {
          backgroundColor: colors.background,
          borderRadius: borderRadius.xxl
        };
    }
  }

  return (
    <View style={[getButtonStyle(), style]}>
      {children}
    </View>
  );
};

export default Card;