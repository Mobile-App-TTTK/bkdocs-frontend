export const API_LOGIN = '/auth/login';
export const API_REQUEST_OTP = '/auth/otp';
export const API_VERIFY_OTP = '/auth/otp/verify';
export const API_REGISTER_COMPLETE = '/auth/register/complete';
export const API_PASSWORD_RESET_REQUEST = '/auth/password-reset';
export const API_PASSWORD_RESET = '/auth/password'; 

// documents
export const API_DOCUMENTS = '/documents';
export const API_SUGGEST_SUBJECTS = `${API_DOCUMENTS}/suggestion/subject`;
export const API_GET_SEARCH_RESULT = `${API_DOCUMENTS}`;
export const API_GET_FACULTIES_AND_SUBJECTS = `${API_DOCUMENTS}/metadata`;
export const API_SUGGEST_KEYWORDS = `${API_DOCUMENTS}/suggestion/keyword`;
export const API_GET_INFORMATION_FACULTY = `${API_DOCUMENTS}/faculty`;
export const API_GET_INFORMATION_SUBJECT = `${API_DOCUMENTS}/subject`;
export const API_UPLOAD_DOCUMENT = `${API_DOCUMENTS}`;
export const API_GET_SUGGESTIONS = `${API_DOCUMENTS}/suggestions/top-downloads`;
export const API_GET_DOCUMENT_DETAIL = (id: string) => `${API_DOCUMENTS}/${id}`;
export const API_DOWNLOAD_DOCUMENT = (id: string) => `${API_DOCUMENTS}/${id}/download`;
export const API_GET_DOWNLOADED_DOC = (id: string) => `${API_DOCUMENTS}/${id}/documents`;

//rates
export const API_RATES = '/rates'
export const API_GET_DOC_RATINGS = (id: string) => `${API_RATES}/document/${id}/reviews`;
export const API_GET_DOC_RECENT_RATINGS = (id: string) => `${API_RATES}/document/${id}/reviews/recent`;
export const API_RATE_STAT = `${API_RATES}/statistics`;

// notifications
export const API_NOTIFICATIONS = '/notifications';
export const API_SUBSCRIBE_FACULTY = `${API_NOTIFICATIONS}/faculty`;
export const API_UNSUBSCRIBE_FACULTY = `${API_NOTIFICATIONS}/faculty`;
export const API_SUBSCRIBE_SUBJECT = `${API_NOTIFICATIONS}/subject`;
export const API_UNSUBSCRIBE_SUBJECT = `${API_NOTIFICATIONS}/subject`;
export const API_MARK_NOTIFICATION_AS_READ = (id: string) => `${API_NOTIFICATIONS}/${id}`;

// users
export const API_USERS = '/users';
export const API_TOGGLE_FOLLOW_USER = `${API_USERS}`;
export const API_USER_PROFILE = `${API_USERS}/profile`;
export const API_USER_PROFILE_BY_ID = (userId: string) => `${API_USERS}/${userId}/profile`;
export const API_USER_DOCUMENTS = `${API_USERS}`;
export const API_UPDATE_PROFILE = `${API_USERS}/profile`;
export const API_FOLLOW_LIST = `${API_USERS}/following-and-subscribing-list`;

// admin
export const API_ADMIN_STATISTICS = '/admin/statistics';
export const API_ADMIN_MEMBERS = '/admin/members';
export const API_ADMIN_MEMBER_BAN_STATUS = (userId: string) => `/admin/members/${userId}/ban-status`;
export const API_ADMIN_PENDING_DOCUMENTS = '/admin/documents/pending';
export const API_ADMIN_DOCUMENT_STATUS = (docId: string) => `/admin/document/${docId}/status`;

// AI
export const API_AI = '/ai';
export const API_AI_CHAT = `${API_AI}/chat`;