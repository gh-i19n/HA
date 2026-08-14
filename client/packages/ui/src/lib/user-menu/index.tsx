"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu";
import { Icon } from "../icons/icon";
import type { AnyIconName } from "../icons/types";
import { useTheme } from "next-themes";
import { cn, formatInitials } from "../utils";

export interface UserMenuLink {
  readonly label: string;
  readonly href: string;
  readonly icon?: AnyIconName;
}

export interface UserMenuProperties {
  readonly name: string;
  readonly email?: string;
  readonly initials?: string;
  readonly roleLabel?: string;
  readonly onLogout: () => void;
  readonly links?: readonly UserMenuLink[];
  readonly className?: string;
  readonly showThemeToggle?: boolean;
}

/** Eventorch account dropdown adapted as a domain-neutral shared UI widget. */
export function UserMenu({
  name,
  email,
  initials,
  roleLabel,
  onLogout,
  links,
  className,
  showThemeToggle = false,
}: UserMenuProperties) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open account menu"
          className={cn(
            "grid size-9 place-items-center rounded-full border border-border bg-primary-subtle text-xs font-semibold text-primary shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            className,
          )}
          title={name}
          type="button"
        >
          {initials ?? formatInitials(name)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            {email ? <span className="text-xs font-normal text-foreground-muted">{email}</span> : null}
            {roleLabel ? <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{roleLabel}</span> : null}
          </div>
        </DropdownMenuLabel>
        {links?.length ? (
          <>
            <DropdownMenuSeparator />
            {links.map((link) => (
              <DropdownMenuItem key={link.href} asChild className="min-h-10 rounded-md px-3">
                <a href={link.href} className="cursor-pointer">
                  {link.icon ? <Icon name={link.icon} size={15} /> : null}
                  <span>{link.label}</span>
                </a>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
        {showThemeToggle ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="min-h-10 cursor-pointer rounded-md px-3"
              onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              <Icon name={resolvedTheme === "dark" ? "Sun" : "Moon"} size={15} />
              <span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span>
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-10 cursor-pointer rounded-md px-3 text-danger"
          onSelect={onLogout}
        >
          <Icon name="LogoutCurve" size={15} />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
