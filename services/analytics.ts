import Constants from 'expo-constants';

// Check if running in Expo Go (no native modules available)
const isExpoGo = Constants.appOwnership === 'expo';

// Lazy load Firebase modules only when not in Expo Go
let analytics: any = null;
let perf: any = null;

if (!isExpoGo) {
  try {
    analytics = require('@react-native-firebase/analytics').default;
    perf = require('@react-native-firebase/perf').default;
  } catch (error) {
    console.warn('[Analytics] Firebase modules not available:', error);
  }
}

// =====================
// FIREBASE ANALYTICS SERVICE
// =====================

/**
 * Log custom events
 */
export const logEvent = async (eventName: string, params?: Record<string, any>) => {
  if (isExpoGo || !analytics) {
    console.log(`[Analytics - Mock] Event logged: ${eventName}`, params);
    return;
  }
  try {
    await analytics().logEvent(eventName, params);
    console.log(`[Analytics] Event logged: ${eventName}`, params);
  } catch (error) {
    console.error('[Analytics] Error logging event:', error);
  }
};

/**
 * Set user ID for analytics
 */
export const setUserId = async (userId: string | null) => {
  if (isExpoGo || !analytics) {
    console.log('[Analytics - Mock] User ID set:', userId);
    return;
  }
  try {
    await analytics().setUserId(userId);
    console.log('[Analytics] User ID set:', userId);
  } catch (error) {
    console.error('[Analytics] Error setting user ID:', error);
  }
};

/**
 * Set user properties
 */
export const setUserProperties = async (properties: Record<string, string | null>) => {
  if (isExpoGo || !analytics) {
    console.log('[Analytics - Mock] User properties set:', properties);
    return;
  }
  try {
    for (const [key, value] of Object.entries(properties)) {
      await analytics().setUserProperty(key, value);
    }
    console.log('[Analytics] User properties set:', properties);
  } catch (error) {
    console.error('[Analytics] Error setting user properties:', error);
  }
};

/**
 * Log screen view - for tracking retention and engagement
 */
export const logScreenView = async (screenName: string, screenClass?: string) => {
  if (isExpoGo || !analytics) {
    console.log(`[Analytics - Mock] Screen view: ${screenName}`);
    return;
  }
  try {
    await analytics().logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log(`[Analytics] Screen view: ${screenName}`);
  } catch (error) {
    console.error('[Analytics] Error logging screen view:', error);
  }
};

// =====================
// ENGAGEMENT EVENTS
// =====================

export const logLogin = async (method: string = 'email') => {
  await logEvent('login', { method });
};

export const logSignUp = async (method: string = 'email') => {
  await logEvent('sign_up', { method });
};

export const logSearch = async (searchTerm: string) => {
  if (isExpoGo || !analytics) {
    console.log('[Analytics - Mock] Search:', searchTerm);
    return;
  }
  await analytics().logSearch({ search_term: searchTerm });
};

export const logViewDocument = async (documentId: string, documentTitle: string, facultyName?: string) => {
  await logEvent('view_document', {
    document_id: documentId,
    document_title: documentTitle,
    faculty_name: facultyName,
  });
};

export const logDownloadDocument = async (documentId: string, documentTitle: string) => {
  await logEvent('download_document', {
    document_id: documentId,
    document_title: documentTitle,
  });
};

export const logUploadDocument = async (documentId: string, documentTitle: string, facultyId?: string) => {
  await logEvent('upload_document', {
    document_id: documentId,
    document_title: documentTitle,
    faculty_id: facultyId,
  });
};

export const logShareDocument = async (documentId: string, method: string) => {
  if (isExpoGo || !analytics) {
    console.log('[Analytics - Mock] Share:', documentId, method);
    return;
  }
  await analytics().logShare({
    content_type: 'document',
    item_id: documentId,
    method,
  });
};

export const logCommentDocument = async (documentId: string) => {
  await logEvent('comment_document', {
    document_id: documentId,
  });
};

export const logFollowUser = async (userId: string) => {
  await logEvent('follow_user', {
    followed_user_id: userId,
  });
};

export const logViewFaculty = async (facultyId: string, facultyName: string) => {
  await logEvent('view_faculty', {
    faculty_id: facultyId,
    faculty_name: facultyName,
  });
};

export const logViewSubject = async (subjectId: string, subjectName: string) => {
  await logEvent('view_subject', {
    subject_id: subjectId,
    subject_name: subjectName,
  });
};

export const logSaveDocument = async (documentId: string) => {
  await logEvent('save_document', {
    document_id: documentId,
  });
};

export const logChatbotInteraction = async (messageType: 'user' | 'bot') => {
  await logEvent('chatbot_interaction', {
    message_type: messageType,
  });
};

// =====================
// USER SATISFACTION & FEEDBACK
// =====================

/**
 * Log user rating/satisfaction score (1-5 stars)
 */
export const logUserRating = async (rating: number, contentType: 'document' | 'app', contentId?: string) => {
  await logEvent('user_rating', {
    rating,
    content_type: contentType,
    content_id: contentId,
  });
};

/**
 * Log feedback submission
 */
export const logFeedbackSubmit = async (feedbackType: 'bug' | 'suggestion' | 'complaint' | 'praise', hasMessage: boolean) => {
  await logEvent('feedback_submit', {
    feedback_type: feedbackType,
    has_message: hasMessage,
  });
};

// =====================
// TIME TRACKING & DROP-OFF
// =====================

// Store screen enter times for duration calculation
const screenEnterTimes: Record<string, number> = {};

/**
 * Track when user enters a screen (call this on screen focus)
 */
export const trackScreenEnter = (screenName: string) => {
  screenEnterTimes[screenName] = Date.now();
};

/**
 * Track when user leaves a screen and log duration (call this on screen blur)
 */
export const trackScreenExit = async (screenName: string) => {
  const enterTime = screenEnterTimes[screenName];
  if (enterTime) {
    const durationSeconds = Math.round((Date.now() - enterTime) / 1000);
    await logEvent('screen_time', {
      screen_name: screenName,
      duration_seconds: durationSeconds,
    });
    delete screenEnterTimes[screenName];
  }
};

/**
 * Log funnel step for drop-off analysis
 */
export const logFunnelStep = async (
  funnelName: string, 
  stepNumber: number, 
  stepName: string,
  completed: boolean = true
) => {
  await logEvent('funnel_step', {
    funnel_name: funnelName,
    step_number: stepNumber,
    step_name: stepName,
    completed,
  });
};

// Pre-defined funnels
export const UploadFunnel = {
  SELECT_FILE: { step: 1, name: 'select_file' },
  ADD_DETAILS: { step: 2, name: 'add_details' },
  SELECT_FACULTY: { step: 3, name: 'select_faculty' },
  SELECT_SUBJECT: { step: 4, name: 'select_subject' },
  SUBMIT: { step: 5, name: 'submit' },
  SUCCESS: { step: 6, name: 'success' },
};

export const SignupFunnel = {
  START: { step: 1, name: 'start' },
  ENTER_EMAIL: { step: 2, name: 'enter_email' },
  ENTER_PASSWORD: { step: 3, name: 'enter_password' },
  VERIFY_OTP: { step: 4, name: 'verify_otp' },
  SUCCESS: { step: 5, name: 'success' },
};

export const logUploadFunnelStep = async (step: { step: number; name: string }, completed: boolean = true) => {
  await logFunnelStep('upload_document', step.step, step.name, completed);
};

export const logSignupFunnelStep = async (step: { step: number; name: string }, completed: boolean = true) => {
  await logFunnelStep('signup', step.step, step.name, completed);
};

// =====================
// FEATURE USAGE TRACKING
// =====================

/**
 * Log feature usage for analyzing which features are popular
 */
export const logFeatureUsage = async (featureName: string, action: 'view' | 'use' | 'complete') => {
  await logEvent('feature_usage', {
    feature_name: featureName,
    action,
  });
};

// Pre-defined features
export const Features = {
  SEARCH: 'search',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  CHATBOT: 'chatbot',
  SAVE_DOCUMENT: 'save_document',
  FOLLOW_USER: 'follow_user',
  COMMENT: 'comment',
  SHARE: 'share',
  VIEW_PDF: 'view_pdf',
  NOTIFICATIONS: 'notifications',
  DARK_MODE: 'dark_mode',
  FILTER_SEARCH: 'filter_search',
};

/**
 * Log user engagement level based on actions count
 */
export const logEngagementLevel = async (actionsCount: number) => {
  let level: string;
  if (actionsCount >= 20) level = 'high';
  else if (actionsCount >= 5) level = 'medium';
  else level = 'low';
  
  await setUserProperties({ engagement_level: level });
};

// =====================
// RETENTION EVENTS
// =====================

export const logAppOpen = async () => {
  if (isExpoGo || !analytics) {
    console.log('[Analytics - Mock] App open');
    return;
  }
  await analytics().logAppOpen();
};

export const logSessionStart = async () => {
  await logEvent('app_session_start');
};

export const logOnboardingComplete = async () => {
  await logEvent('onboarding_complete');
};

export const logNotificationOpened = async (notificationType: string) => {
  await logEvent('notification_opened', {
    notification_type: notificationType,
  });
};

// =====================
// PERFORMANCE MONITORING
// =====================

/**
 * Create a custom trace for performance monitoring
 */
export const startTrace = async (traceName: string) => {
  if (isExpoGo || !perf) {
    console.log(`[Performance - Mock] Trace started: ${traceName}`);
    return null;
  }
  try {
    const trace = await perf().startTrace(traceName);
    console.log(`[Performance] Trace started: ${traceName}`);
    return trace;
  } catch (error) {
    console.error('[Performance] Error starting trace:', error);
    return null;
  }
};

/**
 * Stop a trace and optionally add metrics
 */
export const stopTrace = async (trace: any, metrics?: Record<string, number>) => {
  try {
    if (metrics) {
      for (const [key, value] of Object.entries(metrics)) {
        trace.putMetric(key, value);
      }
    }
    await trace.stop();
    console.log('[Performance] Trace stopped');
  } catch (error) {
    console.error('[Performance] Error stopping trace:', error);
  }
};

/**
 * Measure API call performance
 */
export const measureApiCall = async <T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const trace = await startTrace(`api_${apiName}`);
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const duration = Date.now() - startTime;
    
    if (trace) {
      trace.putMetric('duration_ms', duration);
      trace.putAttribute('status', 'success');
      await trace.stop();
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (trace) {
      trace.putMetric('duration_ms', duration);
      trace.putAttribute('status', 'error');
      await trace.stop();
    }
    
    throw error;
  }
};

/**
 * Enable/disable analytics collection
 */
export const setAnalyticsCollectionEnabled = async (enabled: boolean) => {
  if (isExpoGo || !analytics) {
    console.log(`[Analytics - Mock] Collection ${enabled ? 'enabled' : 'disabled'}`);
    return;
  }
  try {
    await analytics().setAnalyticsCollectionEnabled(enabled);
    console.log(`[Analytics] Collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[Analytics] Error setting collection:', error);
  }
};

/**
 * Enable/disable performance monitoring
 */
export const setPerformanceCollectionEnabled = async (enabled: boolean) => {
  if (isExpoGo || !perf) {
    console.log(`[Performance - Mock] Collection ${enabled ? 'enabled' : 'disabled'}`);
    return;
  }
  try {
    await perf().setPerformanceCollectionEnabled(enabled);
    console.log(`[Performance] Collection ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[Performance] Error setting collection:', error);
  }
};

export default {
  // Core
  logEvent,
  setUserId,
  setUserProperties,
  logScreenView,
  
  // Engagement
  logLogin,
  logSignUp,
  logSearch,
  logViewDocument,
  logDownloadDocument,
  logUploadDocument,
  logShareDocument,
  logCommentDocument,
  logFollowUser,
  logViewFaculty,
  logViewSubject,
  logSaveDocument,
  logChatbotInteraction,
  
  // User Satisfaction & Feedback
  logUserRating,
  logFeedbackSubmit,
  
  // Time Tracking & Drop-off
  trackScreenEnter,
  trackScreenExit,
  logFunnelStep,
  logUploadFunnelStep,
  logSignupFunnelStep,
  UploadFunnel,
  SignupFunnel,
  
  // Feature Usage
  logFeatureUsage,
  Features,
  logEngagementLevel,
  
  // Retention
  logAppOpen,
  logSessionStart,
  logOnboardingComplete,
  logNotificationOpened,
  
  // Performance
  startTrace,
  stopTrace,
  measureApiCall,
  setAnalyticsCollectionEnabled,
  setPerformanceCollectionEnabled,
};
