import { triggerLogout } from "@/utils/authEvents";
import { ACCESS_TOKEN_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";
import { API_LOGIN, API_REGISTER_COMPLETE, API_REGISTER_REQUEST_OTP, API_VERIFY_OTP } from "./apiRoutes";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.url && !config.url.includes(API_LOGIN)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Bỏ qua logic logout/redirect cho các endpoint auth
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = 
        requestUrl.includes(API_LOGIN) ||
        requestUrl.includes(API_REGISTER_REQUEST_OTP) ||
        requestUrl.includes(API_VERIFY_OTP) ||
        requestUrl.includes(API_REGISTER_COMPLETE);
      
      if (!isAuthEndpoint) {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        try {
          await triggerLogout();
        } catch {}
        Alert.alert('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại.');
        try {
          router.replace('/(public)/login');
        } catch {}
      }
    }
    return Promise.reject(error);
  }
);
