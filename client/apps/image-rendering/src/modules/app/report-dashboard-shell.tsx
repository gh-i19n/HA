"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@healthalst/ui/components/dropdown-menu";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger,
} from "@healthalst/ui/components/sidebar";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import type { AnyIconName } from "@healthalst/ui/lib/icons/types";
import { UserMenu } from "@healthalst/ui/lib/user-menu";
import { cn } from "@healthalst/ui/lib/utils";
import { NotificationBell } from "../notifications/notification-bell";
import { reportsService } from "../reports/services/reports.service";
import { settingsService } from "../settings/settings.service";
import type { OrganizationSummary } from "../settings/types";
import type { User } from "../auth/types";

type Properties = {
  user: User;
  reportCount?: number;
  children: ReactNode;
  onLogout: () => Promise<void>;
  onUserChange?: (user: User) => void;
};

const staffNavigation: Array<{ href: string; label: string; icon: AnyIconName; badge?: "reports" | "requests" }> = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/bookings", label: "Bookings", icon: "Calendar" },
  { href: "/bookings/pending", label: "Pending requests", icon: "CalendarClock", badge: "requests" },
  { href: "/reports", label: "Reports", icon: "FileText", badge: "reports" },
];

const patientNavigation: Array<{ href: string; label: string; icon: AnyIconName; badge?: "reports" | "requests" }> = [
  { href: "/results", label: "My results", icon: "FileCheck", badge: "reports" },
];

/** Exact Eventorch dashboard composition with HealthAlst data and route configuration. */
export function ReportDashboardShell({ user, reportCount, children, onLogout, onUserChange }: Properties) {
  const pathname = usePathname();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [pendingRequestCount, setPendingRequestCount] = useState<number | undefined>(undefined);
  const isStaff = user.role === "STAFF";
  const navigation = isStaff ? staffNavigation : patientNavigation;

  useEffect(() => {
    if (!isStaff) return;
    void settingsService.organizations().then(setOrganizations).catch(() => setOrganizations([]));
    void reportsService.listBookings()
      .then((bookings) => setPendingRequestCount(bookings.filter((booking) => booking.status === "REQUESTED").length))
      .catch(() => setPendingRequestCount(0));
  }, [isStaff, user.organizationId]);

  async function switchClinic(id: string) {
    if (id === user.organizationId) return;
    const changed = await settingsService.switchOrganization(id);
    onUserChange?.(changed); router.refresh();
  }

  const title = pathname.startsWith("/settings") ? "Settings"
    : pathname.startsWith("/bookings/pending") ? "Pending requests"
      : pathname.startsWith("/bookings") ? "Bookings"
        : pathname.startsWith("/templates") ? "Report templates"
          : isStaff ? "Report operations" : "My imaging results";

  return (
    <SidebarProvider className={cn("bg-background text-foreground")}>
      <Sidebar collapsible="icon" className={cn("border-r border-sidebar-border")}>
        <SidebarHeader className={cn("border-b border-sidebar-border p-3")}>
          <ClinicSwitcher user={user} organizations={organizations} onSwitch={switchClinic} />
        </SidebarHeader>
        <SidebarContent className={cn("px-3 py-5")}>
          <SidebarGroup className={cn("p-0")}>
            <SidebarGroupLabel className={cn("mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-sidebar-foreground/45")}>{isStaff ? "Laboratory workspace" : "Patient portal"}</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu className={cn("gap-1.5")}>{navigation.map((item) => <NavigationItem key={item.href} {...item} active={pathname === item.href || (pathname === "/" && item === navigation[0])} badge={item.badge === "reports" && reportCount !== undefined ? reportCount : item.badge === "requests" && pendingRequestCount !== undefined ? pendingRequestCount : undefined} />)}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className={cn("mt-6 p-0")}>
            <SidebarGroupLabel className={cn("mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-sidebar-foreground/45")}>Manage</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu className={cn("gap-1.5")}><NavigationItem href="/settings/profile" icon="Settings" label="Settings" active={pathname.startsWith("/settings")} /></SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className={cn("border-t border-sidebar-border p-3 group-data-[collapsible=icon]:hidden")}>
          <div className={cn("rounded-lg bg-sidebar-foreground/[.04] p-3")}>
            <p className={cn("m-0 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45")}>Signed in as</p>
            <p className={cn("m-0 mt-1 truncate text-xs font-semibold text-sidebar-foreground")}>{user.displayName}</p>
            <p className={cn("m-0 mt-0.5 truncate text-[10px] text-sidebar-foreground/50")}>{roleLabel(user)}</p>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className={cn("min-w-0 bg-background")}>
        <header className={cn("sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6 lg:px-8")}>
          <div className={cn("flex min-w-0 items-center gap-3")}><SidebarTrigger className={cn("border border-border bg-surface")} /><div className={cn("min-w-0")}><p className={cn("m-0 truncate text-[10px] font-semibold uppercase tracking-wider text-foreground-muted")}>{isStaff ? user.organizationName : "Patient portal"}</p><p className={cn("m-0 truncate text-sm font-semibold text-foreground")}>{title}</p></div></div>
          <div className={cn("flex items-center gap-2")}>
            <NotificationBell />
            <UserMenu name={user.displayName} email={user.email} roleLabel={roleLabel(user)} onLogout={() => void onLogout()} showThemeToggle links={[{ label: "Profile", href: "/settings/profile", icon: "Users" }, { label: "Notification settings", href: "/settings/notifications", icon: "Settings" }]} />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

function ClinicSwitcher({ user, organizations, onSwitch }: { user: User; organizations: OrganizationSummary[]; onSwitch: (id: string) => Promise<void> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-foreground/10 focus-visible:ring-2 focus-visible:ring-sidebar-ring")}>
          <span className={cn("min-w-0 flex-1 group-data-[collapsible=icon]:hidden")}>
            <span className={cn("block truncate font-serif text-lg leading-none tracking-[-.04em]")}>healthAlst</span>
            <span className={cn("mt-1 block truncate text-[10px] text-sidebar-foreground/50")}>{user.role === "STAFF" ? user.organizationName : "Patient results"}</span>
          </span>
          <span aria-hidden="true" className={cn("hidden font-serif text-lg font-semibold leading-none tracking-[-.06em] group-data-[collapsible=icon]:block")}>hA</span>
          {user.role === "STAFF" && organizations.length > 1 ? <Icon name="ChevronsUpDown" size={14} className={cn("group-data-[collapsible=icon]:hidden")} /> : null}
        </button>
      </DropdownMenuTrigger>
      {user.role === "STAFF" && organizations.length > 1 ? <DropdownMenuContent align="start" className={cn("w-72")}><DropdownMenuLabel>Switch laboratory</DropdownMenuLabel><DropdownMenuSeparator />{organizations.map((organization) => <DropdownMenuItem key={organization.id} onSelect={() => void onSwitch(organization.id)} className={cn("min-h-11")}><Icon name="Building2" size={15} /><span className={cn("flex-1 truncate")}>{organization.name}</span>{organization.id === user.organizationId ? <Icon name="Check" size={15} /> : null}</DropdownMenuItem>)}</DropdownMenuContent> : null}
    </DropdownMenu>
  );
}

function NavigationItem({ href, icon, label, active = false, badge }: { href: string; icon: AnyIconName; label: string; active?: boolean; badge?: number }) {
  return <SidebarMenuItem><SidebarMenuButton asChild isActive={active} tooltip={label} className={cn("h-10 px-3 text-sidebar-foreground/65 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground", active && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}><Link href={href}><Icon name={icon} size={17} /><span>{label}</span></Link></SidebarMenuButton>{badge === undefined ? null : <SidebarMenuBadge className={cn(active && "text-sidebar-accent-foreground")}>{badge > 999 ? "999+" : badge}</SidebarMenuBadge>}</SidebarMenuItem>;
}

function roleLabel(user: User) {
  if (user.role === "PATIENT") return "Verified patient";
  if (user.organizationRole === "OWNER") return "Laboratory owner";
  if (user.organizationRole === "ADMIN") return "Laboratory administrator";
  return "Report staff";
}
