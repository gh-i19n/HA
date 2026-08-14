"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Badge } from "@healthalst/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@healthalst/ui/components/card";
import { InlineNotice } from "@healthalst/ui/components/inline-notice";
import { Input } from "@healthalst/ui/components/input";
import { PageHeader } from "@healthalst/ui/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@healthalst/ui/components/select";
import { Switch } from "@healthalst/ui/components/switch";
import { Textarea } from "@healthalst/ui/components/textarea";
import { MainButton } from "@healthalst/ui/lib/button";
import { Icon } from "@healthalst/ui/lib/icons/icon";
import type { AnyIconName } from "@healthalst/ui/lib/icons/types";
import { cn } from "@healthalst/ui/lib/utils";
import type { User } from "../auth/types";
import { settingsService } from "./settings.service";
import type { ClinicSummary, MemberSummary, NotificationPreferences } from "./types";

type Section = "profile" | "clinic" | "team" | "notifications" | "security";

/** Settings shell with HealthAlst account, laboratory, team and preference workflows. */
export function SettingsView({ user, onUserChange }: { user: User; onUserChange: (user: User) => void }) {
  const pathname = usePathname();
  const section = (pathname.split("/").at(-1) || "profile") as Section;
  const canManageClinic = user.role === "STAFF" && (user.organizationRole === "OWNER" || user.organizationRole === "ADMIN");
  const items: Array<{ section: Section; label: string; description: string; icon: AnyIconName }> = [
    { section: "profile", label: "Profile", description: "Personal details", icon: "Users" },
    { section: "security", label: "Security", description: "Account and session", icon: "Shield" },
    { section: "notifications", label: "Notifications", description: "Update preferences", icon: "Bell" },
    ...(canManageClinic ? [
      { section: "clinic" as const, label: "Laboratory", description: "Workspace details", icon: "Building2" as AnyIconName },
      { section: "team" as const, label: "Team & roles", description: "Members and access", icon: "Users" as AnyIconName },
    ] : []),
  ];
  return (
    <div className={cn("min-h-[calc(100svh-4rem)] bg-surface-subtle/35")}>
      <div className={cn("mx-auto grid w-full max-w-[1500px] gap-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8")}>
        <PageHeader eyebrow="Account and workspace" title="Settings" description="Manage your profile, security, notifications, laboratory details, and team access from one place." />
        <div className={cn("grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]")}>
          <nav aria-label="Settings" className={cn("h-fit rounded-xl bg-surface p-2 shadow-sm")}>
            {items.map((item) => <Link key={item.section} href={`/settings/${item.section}`} className={cn("flex items-center gap-3 rounded-lg px-3 py-3 transition-colors", section === item.section ? "bg-primary-subtle text-primary" : "text-foreground-muted hover:bg-surface-subtle hover:text-foreground")}><span className={cn("grid size-8 place-items-center rounded-lg", section === item.section ? "bg-primary text-primary-foreground" : "bg-surface-subtle")}><Icon name={item.icon} size={15} /></span><span><span className={cn("block text-xs font-semibold")}>{item.label}</span><span className={cn("mt-0.5 block text-[10px] opacity-70")}>{item.description}</span></span></Link>)}
          </nav>
          <div className={cn("min-w-0")}>
            {section === "profile" ? <ProfileSettings user={user} onUserChange={onUserChange} /> : null}
            {section === "security" ? <SecuritySettings user={user} /> : null}
            {section === "notifications" ? <NotificationSettings /> : null}
            {section === "clinic" && canManageClinic ? <ClinicSettings /> : null}
            {section === "team" && canManageClinic ? <TeamSettings /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Card className={cn("gap-0 overflow-hidden py-0 shadow-xs")}><CardHeader className={cn("border-b border-border px-5 py-5 sm:px-6")}><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className={cn("p-5 sm:p-6")}>{children}</CardContent></Card>;
}

function ProfileSettings({ user, onUserChange }: { user: User; onUserChange: (user: User) => void }) {
  const [displayName, setDisplayName] = useState(user.displayName); const [phone, setPhone] = useState(""); const [status, setStatus] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); setStatus(null); try { const profile = await settingsService.updateProfile({ displayName, phone }); onUserChange({ ...user, displayName: profile.displayName }); setStatus("Profile saved."); } catch (reason) { setStatus(reason instanceof Error ? reason.message : "Profile could not be saved."); } finally { setSaving(false); } }
  return <SectionCard title="Profile" description="The name and contact details used across your account."><form className={cn("grid max-w-2xl gap-5")} onSubmit={submit}><SettingsField label="Email"><Input value={user.email} disabled /></SettingsField><SettingsField label="Full name"><Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></SettingsField><SettingsField label="Phone"><Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" /></SettingsField>{status ? <InlineNotice tone={status.endsWith("saved.") ? "ok" : "risk"} title={status.endsWith("saved.") ? "Saved" : "Could not save"}>{status}</InlineNotice> : null}<MainButton className={cn("w-fit")} type="submit" variant="primary" isLoading={saving}>Save profile</MainButton></form></SectionCard>;
}

function SecuritySettings({ user }: { user: User }) {
  return <div className={cn("grid gap-5")}><SectionCard title="Security" description="Account identity and active session details."><div className={cn("grid gap-4")}><InlineNotice tone="ok" title="Session protected">Your browser uses an opaque HttpOnly session. Report access is authorized again when content is opened.</InlineNotice><div className={cn("flex items-center justify-between rounded-xl bg-surface-subtle/45 p-4")}><div className={cn("flex items-center gap-3")}><span className={cn("grid size-10 place-items-center rounded-lg bg-success-subtle text-success")}><Icon name="Shield" size={18} /></span><div><p className={cn("m-0 text-sm font-semibold")}>Current browser session</p><p className={cn("m-0 mt-1 text-xs text-foreground-muted")}>{user.email} · Active now</p></div></div><Badge variant="success">Current</Badge></div></div></SectionCard><SectionCard title="Password" description="Use a strong unique password for this account."><p className={cn("m-0 text-sm text-foreground-muted")}>Password reset will require verified email delivery before production rollout. Your current password remains server-hashed and is never returned to the browser.</p></SectionCard></div>;
}

function NotificationSettings() {
  const [value, setValue] = useState<NotificationPreferences>({ reportUpdates: true, membershipUpdates: true, emailUpdates: false }); const [saving, setSaving] = useState(false); const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { void settingsService.preferences().then(setValue).catch(() => undefined); }, []);
  async function save() { setSaving(true); try { setValue(await settingsService.updatePreferences(value)); setMessage("Notification preferences saved."); } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Preferences could not be saved."); } finally { setSaving(false); } }
  return <SectionCard title="Notifications" description="Choose which account and report updates should reach you."><div className={cn("grid gap-1")}><PreferenceRow title="Report updates" description="Uploads, publication, corrections, and withdrawals." checked={value.reportUpdates} onChange={(checked) => setValue({ ...value, reportUpdates: checked })} /><PreferenceRow title="Membership updates" description="Laboratory invitations, role changes, and access suspension." checked={value.membershipUpdates} onChange={(checked) => setValue({ ...value, membershipUpdates: checked })} /><PreferenceRow title="Email summaries" description="Also send supported transactional updates by email." checked={value.emailUpdates} onChange={(checked) => setValue({ ...value, emailUpdates: checked })} />{message ? <p className={cn("mt-3 text-xs text-foreground-muted")}>{message}</p> : null}<MainButton type="button" variant="primary" className={cn("mt-5 w-fit")} isLoading={saving} onClick={() => void save()}>Save preferences</MainButton></div></SectionCard>;
}

function ClinicSettings() {
  const [clinic, setClinic] = useState<ClinicSummary | null>(null); const [saving, setSaving] = useState(false); const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { void settingsService.clinic().then(setClinic).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Clinic settings could not be loaded.")); }, []);
  if (!clinic) return <SectionCard title="Laboratory workspace" description="Legal and contact details shown on structured reports."><p className={cn("text-sm text-foreground-muted")}>{message ?? "Loading laboratory settings…"}</p></SectionCard>;
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); try { setClinic(await settingsService.updateClinic({ name: clinic!.name, email: clinic!.email, phone: clinic!.phone, address: clinic!.address })); setMessage("Laboratory settings saved."); } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Laboratory settings could not be saved."); } finally { setSaving(false); } }
  return <SectionCard title="Laboratory workspace" description="These details identify your tenant and appear on generated reports."><form className={cn("grid max-w-2xl gap-5")} onSubmit={submit}><SettingsField label="Laboratory name"><Input value={clinic.name} onChange={(event) => setClinic({ ...clinic, name: event.target.value })} required /></SettingsField><div className={cn("grid gap-4 sm:grid-cols-2")}><SettingsField label="Email"><Input type="email" value={clinic.email ?? ""} onChange={(event) => setClinic({ ...clinic, email: event.target.value })} /></SettingsField><SettingsField label="Phone"><Input value={clinic.phone ?? ""} onChange={(event) => setClinic({ ...clinic, phone: event.target.value })} /></SettingsField></div><SettingsField label="Address"><Textarea className={cn("min-h-24")} value={clinic.address ?? ""} onChange={(event) => setClinic({ ...clinic, address: event.target.value })} /></SettingsField>{message ? <p className={cn("text-xs text-foreground-muted")}>{message}</p> : null}<MainButton type="submit" variant="primary" className={cn("w-fit")} isLoading={saving}>Save laboratory</MainButton></form></SectionCard>;
}

function TeamSettings() {
  const [members, setMembers] = useState<MemberSummary[]>([]); const [displayName, setDisplayName] = useState(""); const [email, setEmail] = useState(""); const [role, setRole] = useState<"ADMIN" | "REPORT_STAFF">("REPORT_STAFF"); const [message, setMessage] = useState<string | null>(null);
  const load = () => settingsService.members().then(setMembers).catch((reason) => setMessage(reason instanceof Error ? reason.message : "Team could not be loaded.")); useEffect(() => { void load(); }, []);
  async function add(event: FormEvent) { event.preventDefault(); try { await settingsService.addMember({ displayName, email, role }); setDisplayName(""); setEmail(""); await load(); setMessage("Team member added. Sign-in details are sent by email."); } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Member could not be added."); } }
  return <div className={cn("grid gap-5")}><SectionCard title="Add staff account" description="The laboratory creates the account; sign-in details are emailed to the new staff member."><form className={cn("grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_190px_auto]")} onSubmit={add}><Input placeholder="Full name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /><Input type="email" placeholder="staff@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /><Select value={role} onValueChange={(value) => setRole(value as typeof role)}><SelectTrigger className={cn("w-full")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="REPORT_STAFF">Report staff</SelectItem><SelectItem value="ADMIN">Administrator</SelectItem></SelectContent></Select><MainButton type="submit" variant="primary">Add member</MainButton></form>{message ? <p className={cn("mt-3 text-xs text-foreground-muted")}>{message}</p> : null}</SectionCard><SectionCard title="Team and roles" description="Every member has one independently revocable role in this laboratory."><div className={cn("divide-y divide-border")}>{members.map((member) => <div key={member.id} className={cn("flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center")}><div className={cn("min-w-0 flex-1")}><p className={cn("m-0 truncate text-sm font-semibold")}>{member.displayName}</p><p className={cn("m-0 mt-1 truncate text-xs text-foreground-muted")}>{member.email}</p></div><Badge variant={member.status === "ACTIVE" ? "success" : "warning"}>{member.status.toLowerCase()}</Badge><Select value={member.role} disabled={member.role === "OWNER"} onValueChange={(value) => void settingsService.updateMember({ membershipId: member.id, role: value as MemberSummary["role"], status: member.status }).then(load)}><SelectTrigger className={cn("w-44")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="OWNER">Owner</SelectItem><SelectItem value="ADMIN">Administrator</SelectItem><SelectItem value="REPORT_STAFF">Report staff</SelectItem></SelectContent></Select></div>)}</div></SectionCard></div>;
}

function PreferenceRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) { return <div className={cn("flex items-center justify-between gap-6 border-b border-border py-4 first:pt-0")}><div><p className={cn("m-0 text-sm font-semibold")}>{title}</p><p className={cn("m-0 mt-1 text-xs text-foreground-muted")}>{description}</p></div><Switch checked={checked} onCheckedChange={onChange} aria-label={title} /></div>; }
function SettingsField({ label, children }: { label: string; children: React.ReactNode }) { return <label className={cn("grid gap-2 text-sm font-medium text-foreground")}>{label}{children}</label>; }
