import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Edge, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  edges = ['top'],
  style,
  contentStyle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.content,
          edges.includes('top') && { paddingTop: insets.top },
          edges.includes('bottom') && { paddingBottom: insets.bottom },
          edges.includes('left') && { paddingLeft: insets.left },
          edges.includes('right') && { paddingRight: insets.right },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});

export default ScreenContainer;
