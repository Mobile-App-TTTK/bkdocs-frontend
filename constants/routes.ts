export const ROUTES = {
  HOME: '/(app)/(tabs)/home',
  LOGIN: '/(public)/login',
  ONBOARD: '/(public)/onboard',
  SIGNUP: '/(public)/signup',
  FORGOT_PASSWORD: '/(public)/forgot-password',
  OTP_CODE: '/(public)/otp-code',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];



