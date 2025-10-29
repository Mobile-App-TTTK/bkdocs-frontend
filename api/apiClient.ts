import { ACCESS_TOKEN_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_LOGIN } from "./apiRoutes";

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
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      console.warn("Token expired, user logged out.");
    }
    return Promise.reject(error);
  }
);
