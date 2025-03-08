// src/api/client.ts
import axios from "axios";
import { API_URL } from "../config/constants";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Add response interceptor for error handling
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Handle unauthorized (e.g., redirect to login)
//       // localStorage.removeItem("authToken");
//       // window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

export default apiClient;
