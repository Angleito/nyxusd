import axios from "axios";

const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  },
);

// CDP Operations
export const fetchCDPs = async () => {
  return api.get("/cdp");
};

export const createCDP = async (data: {
  collateralType: string;
  collateralAmount: string;
  debtAmount: string;
  owner: string;
}) => {
  return api.post("/cdp/create", data);
};

export const depositCollateral = async (cdpId: string, amount: string) => {
  return api.post(`/cdp/${cdpId}/deposit`, { amount });
};

export const withdrawCollateral = async (cdpId: string, amount: string) => {
  return api.post(`/cdp/${cdpId}/withdraw`, { amount });
};

export const mintNyxUSD = async (cdpId: string, amount: string) => {
  return api.post(`/cdp/${cdpId}/mint`, { amount });
};

export const burnNyxUSD = async (cdpId: string, amount: string) => {
  return api.post(`/cdp/${cdpId}/burn`, { amount });
};

// System Information
export const fetchSystemStats = async () => {
  return api.get("/system");
};

export const fetchOraclePrices = async () => {
  return api.get("/oracle/prices");
};

// Health Check
export const fetchHealthCheck = async () => {
  return api.get("/health");
};

export default api;
