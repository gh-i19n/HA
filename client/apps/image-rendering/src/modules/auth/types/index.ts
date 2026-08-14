/** Roles supported by the MVP access boundary. */
export type UserRole = "STAFF" | "PATIENT";

/** Safe account data returned by the authentication API. */
export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId: string | null;
  organizationName: string | null;
  organizationRole: "OWNER" | "ADMIN" | "REPORT_STAFF" | null;
};

/** Login form payload sent to the authentication service. */
export type LoginPayload = { email: string; password: string };

/** Laboratory registration payload sent to the laboratory-only register endpoint. */
export type RegistrationPayload = {
  ownerName: string;
  email: string;
  password: string;
  laboratoryName: string;
  location: string;
  address: string;
};
