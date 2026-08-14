export type OrganizationSummary = { id: string; name: string; slug: string; role: "OWNER" | "ADMIN" | "REPORT_STAFF" };
export type ProfileSummary = { id: string; email: string; displayName: string; phone: string | null; avatarUrl: string | null };
export type ClinicSummary = { id: string; name: string; slug: string; email: string | null; phone: string | null; address: string | null };
export type MemberSummary = { id: string; userId: string; displayName: string; email: string; role: "OWNER" | "ADMIN" | "REPORT_STAFF"; status: "ACTIVE" | "SUSPENDED" };
export type NotificationPreferences = { reportUpdates: boolean; membershipUpdates: boolean; emailUpdates: boolean };
