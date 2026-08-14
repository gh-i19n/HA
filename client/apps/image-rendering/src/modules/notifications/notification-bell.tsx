"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@healthalst/ui/components/popover";
import { MainButton } from "@healthalst/ui/lib/button";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import { cn } from "@healthalst/ui/lib/utils";
import { useNotifications } from "./use-notifications";

/** Eventorch-derived notification bell with unread count and durable read actions. */
export function NotificationBell({ enabled = true }: { enabled?: boolean }) {
  const { inbox, error, read, readAll } = useNotifications(enabled);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Notifications${inbox.unreadCount ? `, ${inbox.unreadCount} unread` : ""}`} className={cn("relative grid size-9 place-items-center rounded-lg border border-border bg-surface text-foreground-muted transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30")}>
          <Icon name="Bell" size={17} />
          {inbox.unreadCount ? <span className={cn("absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-surface bg-danger px-1 text-[9px] font-bold leading-4 text-white")}>{inbox.unreadCount > 9 ? "9+" : inbox.unreadCount}</span> : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className={cn("w-[min(92vw,380px)] p-0")}>
        <div className={cn("flex items-center justify-between border-b border-border px-4 py-3")}><div><p className={cn("m-0 text-sm font-semibold")}>Notifications</p><p className={cn("m-0 text-[11px] text-foreground-muted")}>{inbox.unreadCount ? `${inbox.unreadCount} unread update${inbox.unreadCount === 1 ? "" : "s"}` : "You are all caught up"}</p></div>{inbox.unreadCount ? <MainButton type="button" size="sm" variant="ghost" onClick={() => void readAll()}>Mark all read</MainButton> : null}</div>
        <div className={cn("max-h-96 overflow-y-auto")}>
          {error ? <p className={cn("m-0 p-4 text-xs text-danger")}>{error}</p> : null}
          {!error && inbox.items.length === 0 ? <div className={cn("grid place-items-center gap-2 px-5 py-10 text-center")}><span className={cn("grid size-10 place-items-center rounded-full bg-surface-subtle text-foreground-muted")}><Icon name="BellOff" size={18} /></span><p className={cn("m-0 text-sm font-medium")}>No notifications yet</p><p className={cn("m-0 text-xs text-foreground-muted")}>Report and account updates will appear here.</p></div> : null}
          {inbox.items.map((item) => <button key={item.id} type="button" onClick={() => item.readAt ? undefined : void read(item.id)} className={cn("grid w-full grid-cols-[8px_1fr] gap-3 border-b border-border/70 px-4 py-3 text-left transition-colors hover:bg-surface-subtle", !item.readAt && "bg-primary-subtle/30")}><span className={cn("mt-1.5 size-2 rounded-full", item.readAt ? "bg-border-strong" : "bg-primary")} /><span><span className={cn("block text-xs font-semibold text-foreground")}>{item.title}</span><span className={cn("mt-1 block text-xs leading-5 text-foreground-muted")}>{item.body}</span><span className={cn("mt-1.5 block text-[10px] text-foreground-muted")}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</span></span></button>)}
        </div>
      </PopoverContent>
    </Popover>
  );
}
