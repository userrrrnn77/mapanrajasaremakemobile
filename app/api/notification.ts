import api from "./_axios";

export interface INotificationFE {
  _id: string;
  title: string;
  body: string;
  type: "attendance" | "report" | "activity" | "system";
  data?: Record<string, any>;
  status: "pending" | "sent" | "failed" | "read";
  createdAt: string;
  readAt?: string;
}

export interface NotifResponse {
  success: boolean;
  data: INotificationFE[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * 🔥 API CALLS
 */

// 1. Ambil Notif Saya (pake pagination)
export const getMyNotifReq = async (
  page = 1,
  limit = 10,
): Promise<NotifResponse> => {
  const response = await api.get(`/notification/me`, {
    params: { page, limit },
  });
  return response.data;
};

// 2. Baca Satu Notif
export const markAsReadReq = async (id: string) => {
  const response = await api.patch(`/notification/${id}/read`);
  return response.data;
};

// 3. Baca Semua Notif
export const markAllReadReq = async () => {
  const response = await api.patch(`/notification/me/read-all`);
  return response.data;
};

// 4. Hapus Notif
export const deleteNotifReq = async (id: string) => {
  const response = await api.delete(`/notification/${id}`);
  return response.data;
};
