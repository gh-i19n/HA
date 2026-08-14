import { httpClient } from "@/lib/http/http-adapter";
import type { Booking, PageResponse, Report, ReportPreview, ReportTemplate, StructuredReportPayload } from "../types";

/** Provides the HttpAdapter-backed report delivery client for both actors. */
export class ReportsService {
  /** Reads one bounded staff page without transferring report file contents. */
  async listStaffReports(page: number, size: number): Promise<PageResponse<Report>> {
    const response = await httpClient.get<PageResponse<Report>>("/api/staff/reports", { page, size });
    return this.unwrap(response.status, response.data);
  }

  /** Reads one patient-owned page whose visibility has already been filtered server-side. */
  async listPatientReports(page: number, size: number, organizationId?: string): Promise<PageResponse<Report>> {
    const response = await httpClient.get<PageResponse<Report>>("/api/patient/reports", { page, size, ...(organizationId ? { organizationId } : {}) });
    return this.unwrap(response.status, response.data);
  }

  /** Reads the laboratory's appointments; pending requests come first. */
  async listBookings(): Promise<Booking[]> {
    const response = await httpClient.get<Booking[]>("/api/staff/bookings");
    return this.unwrap(response.status, response.data);
  }

  /** Approves a pending request with the confirmed show-up time. */
  async approveBooking(bookingId: string, scheduledTime: string, message?: string): Promise<Booking> {
    const response = await httpClient.post<Booking>(`/api/staff/bookings/${bookingId}/approve`, { scheduledTime, message });
    return this.unwrap(response.status, response.data);
  }

  /** Rejects a pending request with an optional explanation. */
  async rejectBooking(bookingId: string, message?: string): Promise<Booking> {
    const response = await httpClient.post<Booking>(`/api/staff/bookings/${bookingId}/reject`, { message });
    return this.unwrap(response.status, response.data);
  }

  /** Sends one PDF to the staff upload BFF endpoint. */
  async uploadReport(bookingId: string, file: File): Promise<Report> {
    const form = new FormData();
    form.append("bookingId", bookingId);
    form.append("file", file);
    const response = await httpClient.post<Report>("/api/staff/reports", form);
    return this.unwrap(response.status, response.data);
  }

  /** Publishes a pending report after staff confirmation. */
  async publishReport(reportId: string): Promise<Report> {
    const response = await httpClient.post<Report>(`/api/staff/reports/${reportId}/publish`);
    return this.unwrap(response.status, response.data);
  }

  async listTemplates(): Promise<ReportTemplate[]> {
    const response = await httpClient.get<ReportTemplate[]>("/api/backend/staff/report-templates");
    return this.unwrap(response.status, response.data);
  }

  async createStructuredReport(payload: StructuredReportPayload): Promise<Report> {
    const response = await httpClient.post<Report>("/api/backend/staff/reports/structured", payload);
    return this.unwrap(response.status, response.data);
  }

  /** Downloads a report only through the patient-scoped BFF endpoint. */
  async downloadPatientReport(reportId: string): Promise<Blob> {
    return this.previewReport("PATIENT", reportId);
  }

  async previewReport(role: "STAFF" | "PATIENT", reportId: string): Promise<Blob> {
    const actor = role === "STAFF" ? "staff" : "patient";
    return httpClient.getBlob(`/api/backend/${actor}/reports/${reportId}/preview`);
  }

  /** Reads the renderer-free preview document shown instead of an embedded viewer. */
  async previewContent(role: "STAFF" | "PATIENT", reportId: string): Promise<ReportPreview> {
    const actor = role === "STAFF" ? "staff" : "patient";
    const response = await httpClient.get<ReportPreview>(`/api/backend/${actor}/reports/${reportId}/preview-content`);
    return this.unwrap(response.status, response.data);
  }

  async exportReport(role: "STAFF" | "PATIENT", reportId: string, format: "pdf" | "docx"): Promise<Blob> {
    const actor = role === "STAFF" ? "staff" : "patient";
    return httpClient.getBlob(`/api/backend/${actor}/reports/${reportId}/exports/${format}`);
  }

  /** Turns the adapter's status-bearing response into a feature contract. */
  private unwrap<T>(status: number, data: T): T {
    if (status >= 200 && status < 300) return data;
    const detail = (data as { detail?: string } | undefined)?.detail;
    throw new Error(detail ?? "The report request failed.");
  }
}

/** Shared report service instance used by the workspace. */
export const reportsService = new ReportsService();
