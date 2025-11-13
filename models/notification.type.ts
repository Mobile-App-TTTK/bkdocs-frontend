export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    image: string;
  }
  
  export interface NotificationResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data?: {
      notifications: Notification[];
      total: number;
      page: number;
      limit: number;
    };
  }