export const API_LOGIN = '/auth/login';
export const API_REGISTER_REQUEST_OTP = '/auth/register/request-otp';
export const API_VERIFY_OTP = '/auth/verify-otp';
export const API_REGISTER_COMPLETE = '/auth/register/complete';

// documents
export const API_DOCUMENTS = '/documents';
export const API_GET_SUGGESTIONS = `${API_DOCUMENTS}/suggestions`;
export const API_GET_SEARCH_RESULT = `${API_DOCUMENTS}/search`;
export const API_GET_FACULTIES_AND_SUBJECTS = `${API_DOCUMENTS}/falculties-subjects/all`;
export const API_SUGGEST_KEYWORDS = `${API_DOCUMENTS}/suggest/keyword`;

// notifications
export const API_NOTIFICATIONS = '/notifications';
export const API_MARK_NOTIFICATION_AS_READ = (id: string) => `${API_NOTIFICATIONS}/${id}/mark-as-read`;