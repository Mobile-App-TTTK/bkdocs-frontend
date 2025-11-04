export const ROUTES = {
  HOME: '/(app)/(tabs)/home',
  LOGIN: '/(public)/login',
  ONBOARD: '/(public)/onboard',
  SIGNUP: '/(public)/signup',
  FORGOT_PASSWORD: '/(public)/forgot-password',
  OTP_CODE: '/(public)/otp-code',
  SAVED_DOC: '/(app)/saved-doc',
  DOWNLOAD_DOC: '/(app)/download-doc',
  FACULTY: '/(app)/faculity',
  SUBJECT: '/(app)/subject',
  UPLOAD_DETAIL: '/(app)/upload-detail',
  SELECT_FACULTY: '/(app)/select-faculty',
  SELECT_SUBJECT: '/(app)/select-subject',
  SELECT_LIST: '/(app)/select-list',
  SELECT_IMAGES: '/(app)/select-images',
  PROFILE: '/(app)/(tabs)/profile',
  ME: '/(app)/(tabs)/profile/me',
  EDIT_PROFILE: '/(app)/(tabs)/profile/edit',
  FOLLOWING: '/(app)/(tabs)/profile/following',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];



