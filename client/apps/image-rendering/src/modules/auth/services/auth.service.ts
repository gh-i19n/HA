import { HttpAdapter } from "@/lib/http/http-adapter";
import type { LoginPayload, RegistrationPayload, User } from "../types";

/** Provides the HttpAdapter-backed authentication client for the app shell. */
export class AuthService {
  constructor(private readonly http: HttpAdapter) {}

  /** Returns the current account or throws when no valid session exists. */
  async currentUser(): Promise<User | null> {
    const response = await this.http.get<User | null>("/api/auth/me");
    return this.unwrap(response.status, response.data);
  }

  /** Creates a server-side session and returns the authenticated account. */
  async login(payload: LoginPayload): Promise<User> {
    const response = await this.http.post<User>("/api/auth/login", payload);
    return this.unwrap(response.status, response.data);
  }

  /** Registers a laboratory with its owner; patient and staff accounts are created by the platform. */
  async register(payload: RegistrationPayload): Promise<User> {
    const response = await this.http.post<User>("/api/backend/auth/register/laboratory", payload);
    return this.unwrap(response.status, response.data);
  }

  /** Revokes the current session and clears the browser cookie. */
  async logout(): Promise<void> {
    const response = await this.http.post<null>("/api/auth/logout");
    if (response.status !== 204) {
      throw new Error("Sign out failed. Please try again.");
    }
  }

  /** Converts the shared status response into a feature-level error. */
  private unwrap<T>(status: number, data: T): T {
    if (status >= 200 && status < 300) return data;
    const detail = (data as { detail?: string } | undefined)?.detail;
    throw new Error(detail ?? "Authentication request failed.");
  }
}

/** Shared authentication service instance used by the app shell. */
export const authService = new AuthService(new HttpAdapter());
