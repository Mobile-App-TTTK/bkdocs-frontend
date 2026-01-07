
// Mock expo-constants to disable isExpoGo
jest.mock('expo-constants', () => ({
    default: {
        appOwnership: 'standalone', // Not 'expo', so isExpoGo will be false
    },
}));

// Access the mocked modules
const mockLogEvent = jest.fn();
const mockSetUserId = jest.fn();
const mockSetUserProperty = jest.fn();
const mockLogSearch = jest.fn();
const mockLogShare = jest.fn();
const mockLogAppOpen = jest.fn();
const mockSetAnalyticsCollectionEnabled = jest.fn();

const mockStartTrace = jest.fn();
const mockSetPerformanceCollectionEnabled = jest.fn();
const mockPutMetric = jest.fn();
const mockPutAttribute = jest.fn();
const mockStop = jest.fn();
const mockTraceObj = {
    putMetric: mockPutMetric,
    putAttribute: mockPutAttribute,
    stop: mockStop,
};

// Re-mock the modules for this test file
jest.mock('@react-native-firebase/analytics', () => {
    return {
        default: jest.fn(() => ({
            logEvent: mockLogEvent,
            setUserId: mockSetUserId,
            setUserProperty: mockSetUserProperty,
            logSearch: mockLogSearch,
            logShare: mockLogShare,
            logAppOpen: mockLogAppOpen,
            setAnalyticsCollectionEnabled: mockSetAnalyticsCollectionEnabled,
        })),
    };
});

jest.mock('@react-native-firebase/perf', () => {
    return {
        default: jest.fn(() => ({
            startTrace: mockStartTrace,
            setPerformanceCollectionEnabled: mockSetPerformanceCollectionEnabled,
        })),
    };
});

import {
    Features,
    SignupFunnel,
    UploadFunnel,
    logAppOpen,
    logChatbotInteraction,
    logCommentDocument,
    logDownloadDocument,
    logEngagementLevel,
    logEvent,
    logFeatureUsage,
    logFeedbackSubmit,
    logFollowUser,
    logFunnelStep,
    logLogin,
    logNotificationOpened,
    logOnboardingComplete,
    logSaveDocument,
    logScreenView,
    logSearch,
    logSessionStart,
    logShareDocument,
    logSignUp,
    logSignupFunnelStep,
    logUploadDocument,
    logUploadFunnelStep,
    logUserRating,
    logViewDocument,
    logViewFaculty,
    logViewSubject,
    measureApiCall,
    setAnalyticsCollectionEnabled,
    setPerformanceCollectionEnabled,
    setUserId,
    setUserProperties,
    startTrace,
    stopTrace,
    trackScreenEnter,
    trackScreenExit
} from '@/services/analytics';

describe('Analytics Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default success implementation for startTrace
        mockStartTrace.mockResolvedValue(mockTraceObj);
        mockStop.mockResolvedValue(undefined);
    });

    describe('Core Analytics', () => {
        it('logEvent logs event successfully', async () => {
            await logEvent('test_event', { param1: 'value1' });
            expect(mockLogEvent).toHaveBeenCalledWith('test_event', { param1: 'value1' });
        });

        it('logEvent handles error gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockLogEvent.mockRejectedValue(new Error('Test error'));
            await logEvent('test_event');
            expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Error logging event:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('setUserId sets user id successfully', async () => {
            await setUserId('user123');
            expect(mockSetUserId).toHaveBeenCalledWith('user123');
        });

        it('setUserId handles error gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockSetUserId.mockRejectedValue(new Error('Test error'));
            await setUserId('user123');
            expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Error setting user ID:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('setUserProperties sets properties successfully', async () => {
            await setUserProperties({ prop1: 'val1', prop2: 'val2' });
            expect(mockSetUserProperty).toHaveBeenCalledTimes(2);
            expect(mockSetUserProperty).toHaveBeenCalledWith('prop1', 'val1');
            expect(mockSetUserProperty).toHaveBeenCalledWith('prop2', 'val2');
        });

        it('setUserProperties handles error gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockSetUserProperty.mockRejectedValue(new Error('Test error'));
            await setUserProperties({ prop1: 'val1' });
            expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Error setting user properties:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('logScreenView logs screen view successfully', async () => {
            await logScreenView('HomeScreen', 'HomeClass');
            expect(mockLogEvent).toHaveBeenCalledWith('screen_view', {
                screen_name: 'HomeScreen',
                screen_class: 'HomeClass',
            });
        });

        it('logScreenView uses screenName as class if class not provided', async () => {
            await logScreenView('HomeScreen');
            expect(mockLogEvent).toHaveBeenCalledWith('screen_view', {
                screen_name: 'HomeScreen',
                screen_class: 'HomeScreen',
            });
        });

        it('logScreenView handles error gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockLogEvent.mockRejectedValue(new Error('Test error'));
            await logScreenView('HomeScreen');
            expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Error logging screen view:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('Engagement Events', () => {
        it('logLogin logs login event', async () => {
            await logLogin('google');
            expect(mockLogEvent).toHaveBeenCalledWith('login', { method: 'google' });
        });

        it('logLogin uses default method', async () => {
            await logLogin();
            expect(mockLogEvent).toHaveBeenCalledWith('login', { method: 'email' });
        });

        it('logSignUp logs sign up event', async () => {
            await logSignUp('facebook');
            expect(mockLogEvent).toHaveBeenCalledWith('sign_up', { method: 'facebook' });
        });

        it('logSignUp uses default method', async () => {
            await logSignUp();
            expect(mockLogEvent).toHaveBeenCalledWith('sign_up', { method: 'email' });
        });

        it('logSearch logs search event', async () => {
            await logSearch('test query');
            expect(mockLogSearch).toHaveBeenCalledWith({ search_term: 'test query' });
        });

        it('logViewDocument logs view document event', async () => {
            await logViewDocument('doc123', 'Test Doc', 'Faculty 1');
            expect(mockLogEvent).toHaveBeenCalledWith('view_document', {
                document_id: 'doc123',
                document_title: 'Test Doc',
                faculty_name: 'Faculty 1',
            });
        });

        it('logDownloadDocument logs download event', async () => {
            await logDownloadDocument('doc123', 'Test Doc');
            expect(mockLogEvent).toHaveBeenCalledWith('download_document', {
                document_id: 'doc123',
                document_title: 'Test Doc',
            });
        });

        it('logUploadDocument logs upload event', async () => {
            await logUploadDocument('doc123', 'Test Doc', 'fac1');
            expect(mockLogEvent).toHaveBeenCalledWith('upload_document', {
                document_id: 'doc123',
                document_title: 'Test Doc',
                faculty_id: 'fac1',
            });
        });

        it('logShareDocument logs share event', async () => {
            await logShareDocument('doc123', 'facebook');
            expect(mockLogShare).toHaveBeenCalledWith({
                content_type: 'document',
                item_id: 'doc123',
                method: 'facebook',
            });
        });

        it('logCommentDocument logs comment event', async () => {
            await logCommentDocument('doc123');
            expect(mockLogEvent).toHaveBeenCalledWith('comment_document', {
                document_id: 'doc123',
            });
        });

        it('logFollowUser logs follow event', async () => {
            await logFollowUser('user123');
            expect(mockLogEvent).toHaveBeenCalledWith('follow_user', {
                followed_user_id: 'user123',
            });
        });

        it('logViewFaculty logs view faculty event', async () => {
            await logViewFaculty('fac1', 'Faculty Name');
            expect(mockLogEvent).toHaveBeenCalledWith('view_faculty', {
                faculty_id: 'fac1',
                faculty_name: 'Faculty Name',
            });
        });

        it('logViewSubject logs view subject event', async () => {
            await logViewSubject('sub1', 'Subject Name');
            expect(mockLogEvent).toHaveBeenCalledWith('view_subject', {
                subject_id: 'sub1',
                subject_name: 'Subject Name',
            });
        });

        it('logSaveDocument logs save document event', async () => {
            await logSaveDocument('doc123');
            expect(mockLogEvent).toHaveBeenCalledWith('save_document', {
                document_id: 'doc123',
            });
        });

        it('logChatbotInteraction logs chatbot interaction', async () => {
            await logChatbotInteraction('user');
            expect(mockLogEvent).toHaveBeenCalledWith('chatbot_interaction', {
                message_type: 'user',
            });
        });
    });

    describe('User Satisfaction & Feedback', () => {
        it('logUserRating logs rating', async () => {
            await logUserRating(5, 'document', 'doc123');
            expect(mockLogEvent).toHaveBeenCalledWith('user_rating', {
                rating: 5,
                content_type: 'document',
                content_id: 'doc123',
            });
        });

        it('logFeedbackSubmit logs feedback', async () => {
            await logFeedbackSubmit('suggestion', true);
            expect(mockLogEvent).toHaveBeenCalledWith('feedback_submit', {
                feedback_type: 'suggestion',
                has_message: true,
            });
        });
    });

    describe('Time Tracking & Drop-off', () => {
        beforeAll(() => {
            jest.useFakeTimers();
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        it('tracks screen time correctly', async () => {
            const now = Date.now();
            jest.setSystemTime(now);

            trackScreenEnter('TimeScreen');

            jest.setSystemTime(now + 5000); // Advance 5 seconds

            await trackScreenExit('TimeScreen');

            expect(mockLogEvent).toHaveBeenCalledWith('screen_time', {
                screen_name: 'TimeScreen',
                duration_seconds: 5,
            });
        });

        it('does not log if screen enter time is missing', async () => {
            await trackScreenExit('NonExistentScreen');
            expect(mockLogEvent).not.toHaveBeenCalled();
        });

        it('logFunnelStep logs funnel step', async () => {
            await logFunnelStep('test_funnel', 1, 'step1', true);
            expect(mockLogEvent).toHaveBeenCalledWith('funnel_step', {
                funnel_name: 'test_funnel',
                step_number: 1,
                step_name: 'step1',
                completed: true,
            });
        });

        it('logUploadFunnelStep calls logFunnelStep correctly', async () => {
            await logUploadFunnelStep(UploadFunnel.SELECT_FILE, true);
            expect(mockLogEvent).toHaveBeenCalledWith('funnel_step', {
                funnel_name: 'upload_document',
                step_number: UploadFunnel.SELECT_FILE.step,
                step_name: UploadFunnel.SELECT_FILE.name,
                completed: true,
            });
        });

        it('logSignupFunnelStep calls logFunnelStep correctly', async () => {
            await logSignupFunnelStep(SignupFunnel.START, true);
            expect(mockLogEvent).toHaveBeenCalledWith('funnel_step', {
                funnel_name: 'signup',
                step_number: SignupFunnel.START.step,
                step_name: SignupFunnel.START.name,
                completed: true,
            });
        });

    });

    describe('Feature Usage', () => {
        it('logFeatureUsage logs usage', async () => {
            await logFeatureUsage(Features.SEARCH, 'use');
            expect(mockLogEvent).toHaveBeenCalledWith('feature_usage', {
                feature_name: Features.SEARCH,
                action: 'use',
            });
        });

        it('logEngagementLevel logs high engagement', async () => {
            await logEngagementLevel(25);
            expect(mockSetUserProperty).toHaveBeenCalledWith('engagement_level', 'high');
        });

        it('logEngagementLevel logs medium engagement', async () => {
            await logEngagementLevel(10);
            expect(mockSetUserProperty).toHaveBeenCalledWith('engagement_level', 'medium');
        });

        it('logEngagementLevel logs low engagement', async () => {
            await logEngagementLevel(2);
            expect(mockSetUserProperty).toHaveBeenCalledWith('engagement_level', 'low');
        });
    });

    describe('Retention Events', () => {
        it('logAppOpen logs app open', async () => {
            await logAppOpen();
            expect(mockLogAppOpen).toHaveBeenCalled();
        });

        it('logSessionStart logs session start', async () => {
            await logSessionStart();
            expect(mockLogEvent).toHaveBeenCalledWith('app_session_start', undefined);
        });

        it('logOnboardingComplete logs onboarding complete', async () => {
            await logOnboardingComplete();
            expect(mockLogEvent).toHaveBeenCalledWith('onboarding_complete', undefined);
        });

        it('logNotificationOpened logs notification opened', async () => {
            await logNotificationOpened('push');
            expect(mockLogEvent).toHaveBeenCalledWith('notification_opened', { notification_type: 'push' });
        });
    });

    describe('Performance Monitoring', () => {
        it('startTrace starts a trace', async () => {
            const trace = await startTrace('test_trace');
            expect(mockStartTrace).toHaveBeenCalledWith('test_trace');
            expect(trace).toEqual(mockTraceObj);
        });

        it('startTrace handles error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockStartTrace.mockRejectedValue(new Error('Test error'));
            const trace = await startTrace('test_trace');
            expect(consoleSpy).toHaveBeenCalledWith('[Performance] Error starting trace:', expect.any(Error));
            expect(trace).toBeNull();
            consoleSpy.mockRestore();
        });

        it('stopTrace stops a trace', async () => {
            await stopTrace(mockTraceObj, { metric1: 100 });
            expect(mockPutMetric).toHaveBeenCalledWith('metric1', 100);
            expect(mockStop).toHaveBeenCalled();
        });

        it('stopTrace handles error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockStop.mockRejectedValue(new Error('Test error'));
            await stopTrace(mockTraceObj);
            expect(consoleSpy).toHaveBeenCalledWith('[Performance] Error stopping trace:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('measureApiCall measures success', async () => {
            const apiCall = jest.fn().mockResolvedValue('success');
            const result = await measureApiCall('test_api', apiCall);
            expect(result).toBe('success');
            expect(mockStartTrace).toHaveBeenCalledWith('api_test_api');
            expect(mockPutMetric).toHaveBeenCalledWith('duration_ms', expect.any(Number));
            expect(mockPutAttribute).toHaveBeenCalledWith('status', 'success');
            expect(mockStop).toHaveBeenCalled();
        });

        it('measureApiCall measures error', async () => {
            const apiCall = jest.fn().mockRejectedValue(new Error('API Error'));
            await expect(measureApiCall('test_api', apiCall)).rejects.toThrow('API Error');
            expect(mockStartTrace).toHaveBeenCalledWith('api_test_api');
            expect(mockPutMetric).toHaveBeenCalledWith('duration_ms', expect.any(Number));
            expect(mockPutAttribute).toHaveBeenCalledWith('status', 'error');
            expect(mockStop).toHaveBeenCalled();
        });

        it('setAnalyticsCollectionEnabled sets collection', async () => {
            await setAnalyticsCollectionEnabled(true);
            expect(mockSetAnalyticsCollectionEnabled).toHaveBeenCalledWith(true);
        });

        it('setAnalyticsCollectionEnabled handles error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockSetAnalyticsCollectionEnabled.mockRejectedValue(new Error('Test error'));
            await setAnalyticsCollectionEnabled(true);
            expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Error setting collection:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('setPerformanceCollectionEnabled sets collection', async () => {
            await setPerformanceCollectionEnabled(true);
            expect(mockSetPerformanceCollectionEnabled).toHaveBeenCalledWith(true);
        });

        it('setPerformanceCollectionEnabled handles error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            mockSetPerformanceCollectionEnabled.mockRejectedValue(new Error('Test error'));
            await setPerformanceCollectionEnabled(true);
            expect(consoleSpy).toHaveBeenCalledWith('[Performance] Error setting collection:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });
});
