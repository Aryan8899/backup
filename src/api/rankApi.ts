// src/api/rankApi.ts
import apiClient from "./client";

export type RankPrice = {
  rank: string;
  usdPrice: number;
  cumulativeUSDPrice: number;
  itcPerUSDT: number;
  baseCostITC: number;
  adminFee: number;
  totalITCCost: number;
};

export const rankApi = {
  // Get all ranks
  getAllRanks: async () => {
    const response = await apiClient.get("/ranks");
    return response.data;
  },

  // Get rank price
  getRankPrice: async (rank: string) => {
    const response = await apiClient.get(`/ranks/${rank}/price`);
    return response.data;
  },

  // Calculate upgrade cost
  calculateUpgradeCost: async (currentRank: string, targetRank: string) => {
    const response = await apiClient.get(
      `/ranks/upgrade-cost?currentRank=${currentRank}&targetRank=${targetRank}`
    );
    return response.data;
  },
};
