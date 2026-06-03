export const ROUTES = {
  root: "/",
  login: "/login",
  register: "/register",
  subscription: "/subscription",
  payment: "/payment",
  appHome: "/(app)/home",
  appProfile: "/(app)/profile",
  appSettings: "/(app)/settings",
} as const;

export const APP_PATHS = [
  "/home",
  "/trends",
  "/care-plan",
  "/chat",
  "/more",
  "/profile",
  "/settings",
] as const;
