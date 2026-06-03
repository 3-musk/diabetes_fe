// Theme constants for consistent styling across the app

export const colors = {
  // Primary colors
  primary: "#FE6A35",
  primaryForeground: "#FFFFFF",
  primaryBackground: "#FFFFFF",
  primaryLight: "#007AFF20",
  primaryDark: "#0056CC",

  // Secondary colors
  secondary: "#FFDD89",
  secondaryForeground: "#503629",
  secondarybackground: "#FBF9EF",
  secondaryLight: "#FF6B3520",

  // Background colors
  background: "#FBF9EF",
  surface: "#FFFFFF",
  cardBackground: "#FFFFFF",

  // Text colors
  textPrimary: "#503629",
  textSecondary: "#666666",
  textTertiary: "#999999",
  textLight: "#989898",
  textInput: "#191818",

  // Status colors
  success: "#4CAF50",
  successLight: "#E8F5E9",
  error: "#F44336",
  errorLight: "#FFEBEE",
  warning: "#FF9800",
  warningLight: "#FFF3CD",

  // Border colors
  border: "#E5E5E5",
  borderLight: "#DDDDDD",

  // Others
  disabled: "#CCCCCC",
  overlay: "rgba(0, 0, 0, 0.5)",

  // TAB
  tabBackgroundColor: "#503629",
  tabbuttonColor: "#FFFFFF",
  tabButtonHighlightColor: "#FFDD89",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 32,
  full: 9999,
};

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  title: 28,
};

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
};
