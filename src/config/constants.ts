// src/config/constants.ts
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS || "";
export const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS || "";
export const CHAIN_ID = 97; // BSC Testnet

export const RANKS = [
  { id: "", name: "No Rank", color: "gray" },
  { id: "STAR", name: "Star", color: "#FFD700" },
  { id: "BRONZE", name: "Bronze", color: "#CD7F32" },
  { id: "SILVER", name: "Silver", color: "#C0C0C0" },
  { id: "GOLD", name: "Gold", color: "#FFD700" },
  { id: "DIAMOND", name: "Diamond", color: "#B9F2FF" },
  { id: "BLUE_DIAMOND", name: "Blue Diamond", color: "#4169E1" },
  { id: "BLACK_DIAMOND", name: "Black Diamond", color: "#000000" },
  { id: "ROYAL_DIAMOND", name: "Royal Diamond", color: "#8A2BE2" },
  { id: "CROWN_DIAMOND", name: "Crown Diamond", color: "#FF6347" },
];
