import { httpClient } from "@/lib/http/http-adapter";
import type { User } from "../auth/types";
import type { ClinicSummary, MemberSummary, NotificationPreferences, OrganizationSummary, ProfileSummary } from "./types";

class SettingsService {
  private unwrap<T>(status: number, data: T): T {
    if (status >= 200 && status < 300) return data;
    throw new Error((data as { detail?: string }).detail ?? "The settings request failed.");
  }
  async organizations() { const response = await httpClient.get<OrganizationSummary[]>("/api/backend/organizations"); return this.unwrap(response.status, response.data); }
  async switchOrganization(organizationId: string) { const response = await httpClient.post<User>("/api/backend/auth/switch-organization", { organizationId }); return this.unwrap(response.status, response.data); }
  async updateProfile(payload: { displayName: string; phone?: string; avatarUrl?: string }) { const response = await httpClient.patch<ProfileSummary>("/api/backend/profile", payload); return this.unwrap(response.status, response.data); }
  async clinic() { const response = await httpClient.get<ClinicSummary>("/api/backend/organizations/current"); return this.unwrap(response.status, response.data); }
  async updateClinic(payload: Omit<ClinicSummary, "id" | "slug">) { const response = await httpClient.patch<ClinicSummary>("/api/backend/organizations/current", payload); return this.unwrap(response.status, response.data); }
  async members() { const response = await httpClient.get<MemberSummary[]>("/api/backend/organizations/current/members"); return this.unwrap(response.status, response.data); }
  async addMember(payload: { displayName: string; email: string; role: "ADMIN" | "REPORT_STAFF" }) { const response = await httpClient.post<MemberSummary>("/api/backend/organizations/current/members", payload); return this.unwrap(response.status, response.data); }
  async updateMember(payload: { membershipId: string; role: MemberSummary["role"]; status: MemberSummary["status"] }) { const response = await httpClient.patch<MemberSummary>("/api/backend/organizations/current/members", payload); return this.unwrap(response.status, response.data); }
  async preferences() { const response = await httpClient.get<NotificationPreferences>("/api/backend/settings/notifications"); return this.unwrap(response.status, response.data); }
  async updatePreferences(payload: NotificationPreferences) { const response = await httpClient.patch<NotificationPreferences>("/api/backend/settings/notifications", payload); return this.unwrap(response.status, response.data); }
}

export const settingsService = new SettingsService();
