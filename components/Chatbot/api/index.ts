import { api } from "@/api/apiClient";
import { API_AI_CHAT } from "@/api/apiRoutes";
import { useMutation } from "@tanstack/react-query";

export interface ChatMessage {
  role: "student" | "admin";
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
  intent?: string;
  suggestedActions?: string[];
}

export interface ChatApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ChatResponse;
}

export const sendChatMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  const res = await api.post<ChatApiResponse>(API_AI_CHAT, data);
  return res.data.data;
};

export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: sendChatMessage,
  });
};

