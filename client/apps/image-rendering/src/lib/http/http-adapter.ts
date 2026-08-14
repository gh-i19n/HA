import { isAxiosError } from "axios";
import http from "./http-config";

/** Normalized HTTP result used by application service wrappers. */
export type HttpResponse<T> = { data: T; status: number };

/** Query values accepted by the shared request adapter. */
export type QueryParameters = Record<string, string | number | boolean | undefined>;

/** Keeps Axios details out of feature components and services. */
export class HttpAdapter {
  /** Serializes defined query values with URL-safe escaping. */
  private buildQueryString(query: QueryParameters): string {
    return Object.entries(query)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join("&");
  }

  /** Converts expected HTTP failures into status-bearing results for service wrappers. */
  private async handleRequest<T>(requestFunction: () => Promise<{ data: T; status: number }>): Promise<HttpResponse<T>> {
    try {
      return await requestFunction();
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return { data: error.response.data as T, status: error.response.status };
      }
      throw error;
    }
  }

  /** Executes a typed GET request through the shared Axios configuration. */
  async get<T>(endpoint: string, query: QueryParameters = {}): Promise<HttpResponse<T>> {
    const queryString = this.buildQueryString(query);
    return this.handleRequest(() => http.get<T>(queryString ? `${endpoint}?${queryString}` : endpoint));
  }

  /** Executes a typed JSON or multipart POST request through Axios. */
  async post<T>(endpoint: string, data?: unknown): Promise<HttpResponse<T>> {
    return this.handleRequest(() => http.post<T>(endpoint, data));
  }

  /** Executes a typed partial update through the shared transport. */
  async patch<T>(endpoint: string, data?: unknown): Promise<HttpResponse<T>> {
    return this.handleRequest(() => http.patch<T>(endpoint, data));
  }

  /** Downloads a protected file as a browser Blob. */
  async getBlob(endpoint: string): Promise<Blob> {
    const response = await http.get<Blob>(endpoint, { responseType: "blob" });
    return response.data;
  }
}

/** Shared adapter instance used by all feature services. */
export const httpClient = new HttpAdapter();
