export const ROUTES = {
  HOME: '/(app)/(tabs)/home',
  LOGIN: '/(public)/login',
  ONBOARD: '/(public)/onboard',
  SIGNUP: '/(public)/signup',
  FORGOT_PASSWORD: '/(public)/forgot-password',
  OTP_CODE: '/(public)/otp-code',
  SAVED_DOC: '/(app)/saved-doc',
  DOWNLOAD_DOC: '/(app)/download-doc',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];



