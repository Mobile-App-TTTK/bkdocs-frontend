export const ROUTES = {
  HOME: '/(app)/home',
  LOGIN: '/(public)/login',
  ONBOARD: '/(public)/onboard',
  SIGNUP: '/(public)/signup',
  FORGOT_PASSWORD: '/(public)/forgot-password',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];


