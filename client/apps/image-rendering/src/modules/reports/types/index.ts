/** Report lifecycle states exposed by the API. */
export type ReportStatus = "PENDING" | "AVAILABLE";

/** Metadata returned for one row without loading report bytes. */
export type Report = {
  id: string;
  bookingId: string;
  patientId: string;
  patientName: string;
  examType: string;
  bookingDate: string;
  organizationId: string;
  organizationName: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  status: ReportStatus;
  uploadedAt: string;
  templateKey: "CHEST_XRAY" | "MRI_BRAIN" | null;
  exportFormats: Array<"PDF" | "DOCX">;
};

/** Appointment lifecycle states exposed by the staff and patient views. */
export type BookingStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";

/** Booking metadata returned for staff queues and patient appointment lists. */
export type Booking = {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  organizationName: string | null;
  examType: string;
  bookingDate: string;
  scheduledTime: string | null;
  status: BookingStatus;
};

/** Stable page contract shared by staff and patient report lists. */
export type PageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ReportTemplate = {
  key: "CHEST_XRAY" | "MRI_BRAIN";
  title: string;
  examination: string;
  version: number;
};

export type StructuredReportPayload = {
  bookingId: string;
  template: ReportTemplate["key"];
  content: {
    clinicalIndication: string;
    technique: string;
    comparison: string;
    findings: string;
    impression: string;
    reportingProfessional: string;
    professionalTitle: string;
  };
};

/** Header fact rendered in the preview document's masthead. */
export type ReportPreviewFact = {
  label: string;
  value: string;
};

/** One canonical chapter of a structured report preview. */
export type ReportPreviewSection = {
  heading: string;
  body: string;
};

/** Renderer-free preview payload returned by the BFF preview-content endpoint. */
export type ReportPreview = {
  clinicName: string;
  clinicAddress: string | null;
  facts: ReportPreviewFact[];
  sections: ReportPreviewSection[];
  extractedText: string | null;
  status: ReportStatus;
};
