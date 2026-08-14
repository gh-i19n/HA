export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  resourceType: string | null;
  resourceId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationInbox = { unreadCount: number; items: NotificationItem[] };
