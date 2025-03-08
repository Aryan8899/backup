import apiClient from "./client";

export interface RegistrationRequest {
  address: string;
  referrerAddress?: string;
  rank: string;
}

export interface RegistrationSession {
  sessionId: string;
  address: string;
  referrerAddress?: string;
  rank: string;
  baseCost: number;
  adminFee: number;
  totalCost: number;
  expiry: number;
}

export interface UpgradeSession {
  sessionId: string;
  userId: string;
  address: string;
  currentRank: string;
  newRank: string;
  baseCost: number;
  adminFee: number;
  totalCost: number;
  expiry: number;
}

export interface RegistrationProcessRequest {
  sessionData: RegistrationSession;
  transactionHash: string;
}

export interface UpgradeProcessRequest {
  sessionData: UpgradeSession;
  transactionHash: string;
}

export const userApi = {
  // Create registration session
  createRegistrationSession: async (data: RegistrationRequest) => {
    try {
      console.log("Creating registration session with data:", data);
      const response = await apiClient.post("/users/register", data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Failed to create registration session:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Process registration after blockchain transaction
  processRegistration: async (data: {
    sessionData: RegistrationSession;
    transactionHash: string;
  }) => {
    try {
      console.log("Processing registration with data:", data);

      // The backend expects just sessionId and transactionHash based on the controller
      const processRequest: RegistrationProcessRequest = {
        sessionData: data.sessionData,
        transactionHash: data.transactionHash,
      };

      console.log("Sending to backend:", processRequest);
      const response = await apiClient.post(
        "/users/process-registration",
        processRequest
      );
      console.log("Registration processing result:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Process registration error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Get user by Ethereum address
  getUserByAddress: async (address: string) => {
    try {
      console.log(`Fetching user with address: ${address}`);
      const response = await apiClient.get(`/users/address/${address}`);
      return response.data;
    } catch (error: any) {
      // If user not found, return null instead of throwing error
      if (error.response?.status === 404) {
        console.log(`User with address ${address} not found`);
        return { status: "error", data: null };
      }
      console.error(
        `Error fetching user by address: ${
          error.response?.data?.message || error.message
        }`
      );
      throw error;
    }
  },

  // Get user details
  getUserDetails: async (userId: string) => {
    try {
      console.log(`Fetching details for user: ${userId}`);
      const response = await apiClient.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        `Error fetching user details: ${
          error.response?.data?.message || error.message
        }`
      );
      throw error;
    }
  },

  // Create upgrade session
  createUpgradeSession: async (userId: string, newRank: string) => {
    try {
      console.log(
        `Creating upgrade session for user ${userId} to rank ${newRank}`
      );
      const response = await apiClient.post(`/users/${userId}/upgrade`, {
        newRank,
      });
      console.log("Upgrade session created:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        `Error creating upgrade session: ${
          error.response?.data?.message || error.message
        }`
      );
      throw error;
    }
  },

  // Process upgrade after blockchain transaction
  processUpgrade: async (data: {
    sessionData: UpgradeSession;
    transactionHash: string;
  }) => {
    try {
      console.log("Processing upgrade with data:", data);

      // The backend expects just sessionId and transactionHash
      const processRequest: UpgradeProcessRequest = {
        sessionData: data.sessionData,
        transactionHash: data.transactionHash,
      };

      console.log("Sending to backend:", processRequest);
      const response = await apiClient.post(
        "/users/process-upgrade",
        processRequest
      );
      console.log("Upgrade processing result:", response.data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Process upgrade error:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  },

  // Get user transactions
  getUserTransactions: async (
    userId: string,
    page = 1,
    limit = 20,
    type?: string,
    transactionType?: string
  ) => {
    try {
      let url = `/users/${userId}/transactions?page=${page}&limit=${limit}`;

      if (type) {
        url += `&type=${type}`;
      }

      if (transactionType) {
        url += `&transactionType=${transactionType}`;
      }

      console.log(`Fetching transactions for user ${userId} with params:`, {
        page,
        limit,
        type,
        transactionType,
      });
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error(
        `Error fetching user transactions: ${
          error.response?.data?.message || error.message
        }`
      );
      throw error;
    }
  },

  // Get user downline
  getUserDownline: async (userId: string, level = 5) => {
    try {
      console.log(`Fetching downline for user ${userId} with level ${level}`);
      const response = await apiClient.get(
        `/users/${userId}/downline?level=${level}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        `Error fetching user downline: ${
          error.response?.data?.message || error.message
        }`
      );
      throw error;
    }
  },

  // Get user upline
  getUserUpline: async (userId: string) => {
    try {
      console.log(`Fetching upline for user ${userId}`);
      const response = await apiClient.get(`/users/${userId}/upline`);
      return response.data;
    } catch (error: any) {
      console.error(
        `Error fetching user upline: ${
          error.response?.data?.message || error.message
        }`
      );
      throw error;
    }
  },
};
