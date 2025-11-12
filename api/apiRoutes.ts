export const API_LOGIN = '/auth/login';
export const API_REGISTER_REQUEST_OTP = '/auth/register/request-otp';
export const API_VERIFY_OTP = '/auth/verify-otp';
export const API_REGISTER_COMPLETE = '/auth/register/complete';

// documents
export const API_DOCUMENTS = '/documents';
export const API_SUGGEST_SUBJECTS = `${API_DOCUMENTS}/suggest/subject`;
export const API_GET_SEARCH_RESULT = `${API_DOCUMENTS}/search`;
export const API_GET_FACULTIES_AND_SUBJECTS = `${API_DOCUMENTS}/faculties-subjects-documentTypes/all`;
export const API_SUGGEST_KEYWORDS = `${API_DOCUMENTS}/suggest/keyword`;
export const API_GET_INFORMATION_FACULTY = `${API_DOCUMENTS}/faculty`;
export const API_GET_INFORMATION_SUBJECT = `${API_DOCUMENTS}/subject`;
export const API_UPLOAD_DOCUMENT = `${API_DOCUMENTS}/upload`;

// notifications
export const API_NOTIFICATIONS = '/notifications';
export const API_SUBSCRIBE_FACULTY = `${API_NOTIFICATIONS}/faculty`;
export const API_UNSUBSCRIBE_FACULTY = `${API_NOTIFICATIONS}/faculty`;
export const API_SUBSCRIBE_SUBJECT = `${API_NOTIFICATIONS}/subject`;
export const API_UNSUBSCRIBE_SUBJECT = `${API_NOTIFICATIONS}/subject`;

// users
export const API_USERS = '/users';
export const API_TOGGLE_FOLLOW_USER = `${API_USERS}`;
export const API_USER_PROFILE = `${API_USERS}/profile`;
export const API_USER_DOCUMENTS = `${API_USERS}`;
export const API_UPDATE_PROFILE = `${API_USERS}/profile`;