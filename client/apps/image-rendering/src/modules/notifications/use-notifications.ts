"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationService } from "./notification.service";
import type { NotificationInbox } from "./types";

/** Eventorch realtime pattern: SSE nudges a refetch while durable REST state stays authoritative. */
export function useNotifications(enabled: boolean) {
  const [inbox, setInbox] = useState<NotificationInbox>({ unreadCount: 0, items: [] });
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!enabled) return;
    try { setInbox(await notificationService.inbox()); setError(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Notifications are unavailable."); }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const initialLoad = window.setTimeout(() => void load(), 0);
    const source = new EventSource("/api/backend/notifications/stream");
    source.onmessage = () => void load();
    const fallback = window.setInterval(() => void load(), 60_000);
    return () => { source.close(); window.clearTimeout(initialLoad); window.clearInterval(fallback); };
  }, [enabled, load]);

  const read = useCallback(async (id: string) => { await notificationService.read(id); await load(); }, [load]);
  const readAll = useCallback(async () => { await notificationService.readAll(); await load(); }, [load]);
  return { inbox, error, reload: load, read, readAll };
}
