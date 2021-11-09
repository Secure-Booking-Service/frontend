import axios, { AxiosInstance } from "axios";

const URL = process.env.VUE_APP_API_URL + "/api";

export const api: AxiosInstance = axios.create({
  baseURL: URL,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus() {
    return true;
  },
});