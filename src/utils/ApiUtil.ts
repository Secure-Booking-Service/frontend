import axios, { AxiosInstance } from "axios";

const URL = import.meta.env.VITE_APP_API_URL + "/api";

export const api: AxiosInstance = axios.create({
  baseURL: URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  validateStatus() {
    return true;
  },
});
