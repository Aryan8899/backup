// src/api/rewardApi.ts
import apiClient from "./client";

export interface WithdrawalSession {
  sessionId: string;
  userId: string;
  address: string;
  amount: number;
  fee: number;
  totalAmount: number;
  type: "LEVEL" | "LTG" | "RAB";
  expiry: number;
}

export interface TransactionProcess {
  sessionId: string;
  transactionHash: string;
}

export const rewardApi = {
  // Create level income withdrawal session
  createLevelWithdrawal: async (userId: string) => {
    const response = await apiClient.post(`/rewards/${userId}/withdraw/level`);
    return response.data;
  },

  // Process level income withdrawal
  processLevelWithdrawal: async (data: TransactionProcess) => {
    const response = await apiClient.post(
      "/rewards/process-level-withdrawal",
      data
    );
    return response.data;
  },

  // Create LTG bonus withdrawal session
  createLTGWithdrawal: async (userId: string) => {
    try {
      const response = await apiClient.post(`/rewards/${userId}/withdraw/ltg`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Failed to Withdraw LTG:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Process LTG bonus withdrawal
  processLTGWithdrawal: async (data: TransactionProcess) => {
    const response = await apiClient.post(
      "/rewards/process-ltg-withdrawal",
      data
    );
    return response.data;
  },

  // Create RAB income withdrawal session
  createRABWithdrawal: async (userId: string) => {
    const response = await apiClient.post(`/rewards/${userId}/withdraw/rab`);
    return response.data;
  },

  // Process RAB income withdrawal
  processRABWithdrawal: async (data: TransactionProcess) => {
    const response = await apiClient.post(
      "/rewards/process-rab-withdrawal",
      data
    );
    return response.data;
  },

  // Get LTG bonus status
  getLTGBonusStatus: async (userId: string) => {
    const response = await apiClient.get(`/rewards/${userId}/ltg-status`);
    return response.data;
  },

  // Get RAB statistics
  getRABStatistics: async () => {
    const response = await apiClient.get("/rewards/rab-statistics");
    return response.data;
  },


  // Add this to the rewardApi object
getRewardStats: async () => {
  try {
    console.log("Fetching reward statistics");
    const response = await apiClient.get("/rewards/stats");
    return response.data;
  } catch (error: any) {
    console.error(
      `Error fetching reward statistics: ${
        error.response?.data?.message || error.message
      }`
    );
    throw error;
  }
},
};
