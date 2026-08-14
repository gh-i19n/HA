import { httpClient } from "@/lib/http/http-adapter";
import type { NotificationInbox } from "./types";

class NotificationService {
  async inbox(): Promise<NotificationInbox> {
    const response = await httpClient.get<NotificationInbox>("/api/backend/notifications");
    if (response.status >= 200 && response.status < 300) return response.data;
    throw new Error((response.data as { detail?: string }).detail ?? "Notifications could not be loaded.");
  }
  async read(id: string): Promise<void> { await httpClient.post(`/api/backend/notifications/${id}/read`); }
  async readAll(): Promise<void> { await httpClient.post("/api/backend/notifications/read-all"); }
}

export const notificationService = new NotificationService();
