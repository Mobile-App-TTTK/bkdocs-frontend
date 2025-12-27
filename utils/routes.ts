export const ROUTES = {
  HOME: '/(app)/(tabs)/home',
  SEARCH: '/(app)/(tabs)/search',
  LOGIN: '/(public)/login',
  ONBOARD: '/(public)/onboard',
  SIGNUP: '/(public)/signup',
  FORGOT_PASSWORD: '/(public)/forgot-password',
  OTP_CODE: '/(public)/otp-code',
  NEW_PASSWORD: '/(public)/new-password',
  SAVED_DOC: '/(app)/saved-doc',
  DOWNLOAD_DOC: '/(app)/doc-detail',
  WRITE_COMMENT: '/(app)/write-comment',
  ALL_COMMENT: '/(app)/all-comment',
  NOTIFICATION: '/(app)/(tabs)/notification',
  FACULTY: '/(app)/faculty',
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
  USER_PROFILE: '/(app)/profile/[id]',
  CHATBOT: '/(app)/chatbot',
  ADMIN_MEMBER_MANAGEMENT: '/(app)/admin/member-management',
  ADMIN_DOCUMENT_MANAGEMENT: '/(app)/admin/document-management',
  SEARCH: '/(app)/(tabs)/search',
} as const; 

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];



