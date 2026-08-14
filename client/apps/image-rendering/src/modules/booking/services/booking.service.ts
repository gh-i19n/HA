import { httpClient } from "@/lib/http/http-adapter";
import type { AppointmentConfirmation, AppointmentRequest, PublicLaboratory } from "../types";

/** Public booking client used by the no-account appointment page. */
export class BookingService {
  async listLaboratories(): Promise<PublicLaboratory[]> {
    const response = await httpClient.get<PublicLaboratory[]>("/api/backend/public/laboratories");
    return this.unwrap(response.status, response.data);
  }

  async createAppointment(payload: AppointmentRequest): Promise<AppointmentConfirmation> {
    const response = await httpClient.post<AppointmentConfirmation>("/api/backend/public/appointments", payload);
    return this.unwrap(response.status, response.data);
  }

  /** Converts the shared status response into a feature-level error. */
  private unwrap<T>(status: number, data: T): T {
    if (status >= 200 && status < 300) return data;
    const detail = (data as { detail?: string } | undefined)?.detail;
    throw new Error(detail ?? "The booking request failed.");
  }
}

/** Shared booking service instance used by the public appointment page. */
export const bookingService = new BookingService();