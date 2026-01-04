import { isInitializing, triggerLogout } from "@/utils/authEvents";
import { ACCESS_TOKEN_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";
import { API_LOGIN, API_REGISTER_COMPLETE, API_REQUEST_OTP, API_VERIFY_OTP } from "./apiRoutes";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isLoggingOut = false;
let isNavigatingToServerError = false;

export const resetLogoutFlag = () => {
  isLoggingOut = false;
};

api.interceptors.request.use(
  async (config) => {
    const requestUrl = config.url || '';
    const isAuthEndpoint = 
      requestUrl.includes(API_LOGIN) ||
      requestUrl.includes(API_REQUEST_OTP) ||
      requestUrl.includes(API_VERIFY_OTP) ||
      requestUrl.includes(API_REGISTER_COMPLETE);
    
    if (isLoggingOut && !isAuthEndpoint) {
      return Promise.reject(new Error('Session expired, please login again'));
    }

    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.url && !config.url.includes(API_LOGIN)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Bỏ qua logic logout/redirect cho các endpoint auth
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = 
        requestUrl.includes(API_LOGIN) ||
        requestUrl.includes(API_REQUEST_OTP) ||
        requestUrl.includes(API_VERIFY_OTP) ||
        requestUrl.includes(API_REGISTER_COMPLETE);
      
      if (!isAuthEndpoint && !isLoggingOut) {
        isLoggingOut = true;
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        try {
          await triggerLogout();
        } catch {}
        // Only show alert if not during app initialization (e.g., checking stored token on startup)
        if (!isInitializing) {
          Alert.alert('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại.');
          try {
            router.replace('/(public)/login');
          } catch {}
        }
        // During initialization, don't show alert or redirect - let AuthContext handle navigation
      }
    } else {
      const isServerError = status && status >= 500;
      const isNetworkError = !error.response;
      // Chỉ redirect sang màn lỗi server nếu user đã đăng nhập (có token)
      const hasToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

      if ((isServerError || isNetworkError) && hasToken && !isNavigatingToServerError) {
        isNavigatingToServerError = true;
        try {
          router.replace('/server-error');
        } catch {
          // ignore navigation errors
        } finally {
          // Cho phép navigate lại nếu user đã rời màn hình lỗi
          setTimeout(() => {
            isNavigatingToServerError = false;
          }, 5000);
        }
      }
    }
    return Promise.reject(error);
  }
);
