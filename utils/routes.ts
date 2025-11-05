export const ROUTES = {
  HOME: '/(app)/(tabs)/home',
  LOGIN: '/(public)/login',
  ONBOARD: '/(public)/onboard',
  SIGNUP: '/(public)/signup',
  FORGOT_PASSWORD: '/(public)/forgot-password',
  OTP_CODE: '/(public)/otp-code',
  SAVED_DOC: '/(app)/saved-doc',
  DOWNLOAD_DOC: '/(app)/doc-detail',
  WRITE_COMMENT: '/(app)/write-comment',
  ALL_COMMENT: '/(app)/all-comment',
  NOTIFICATION: '/(app)/(tabs)/notification',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];



