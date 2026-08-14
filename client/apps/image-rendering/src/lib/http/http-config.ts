import axios from "axios";

/** Uses same-origin BFF routes so the browser never needs to read the session cookie. */
const http = axios.create({
  baseURL: "",
  withCredentials: true,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

/** Lets Axios choose the multipart boundary when a service sends FormData. */
http.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

export default http;
