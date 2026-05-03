import { create } from "zustand";
import {
  getMyNotifReq,
  markAsReadReq,
  markAllReadReq,
  INotificationFE,
} from "../api/notification";

interface NotificationState {
  notifications: INotificationFE[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  handleRead: (id: string) => Promise<void>;
  handleReadAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await getMyNotifReq(1, 20);
      if (res.success) {
        const unread = res.data.filter((n) => n.status !== "read").length;
        set({ notifications: res.data, unreadCount: unread });
      }
    } catch (err) {
      console.error("Gagal ambil notif:", err);
    } finally {
      set({ loading: false });
    }
  },

  handleRead: async (id: string) => {
    try {
      await markAsReadReq(id);
      // Ambil state saat ini pake get()
      const { notifications, unreadCount } = get();

      const updatedNotifs = notifications.map((n) =>
        n._id === id ? { ...n, status: "read" as const } : n,
      );

      set({
        notifications: updatedNotifs,
        unreadCount: Math.max(0, unreadCount - 1),
      });
    } catch (err) {
      console.error("Gagal mark as read", err);
    }
  },

  handleReadAll: async () => {
    try {
      await markAllReadReq();
      const { notifications } = get();

      set({
        notifications: notifications.map((n) => ({
          ...n,
          status: "read" as const,
        })),
        unreadCount: 0,
      });
    } catch (err) {
      console.error("Gagal mark all read", err);
    }
  },
}));
