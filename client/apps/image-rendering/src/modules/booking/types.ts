/** One registered laboratory shown in the patient booking dropdown. */
export type PublicLaboratory = {
  id: string;
  name: string;
  location: string | null;
  address: string | null;
};

/** Appointment request payload sent to the public booking endpoint. */
export type AppointmentRequest = {
  patientName: string;
  patientEmail: string;
  laboratoryId: string;
  examType: string;
  preferredDate: string;
};

/** Booking confirmation returned after the request is created. */
export type AppointmentConfirmation = {
  id: string;
  patientName: string;
  patientEmail: string;
  examType: string;
  bookingDate: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  organizationId: string;
  organizationName: string;
};