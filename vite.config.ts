import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
 

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ethers5: "ethers",
    },
  },
  build: {
    rollupOptions: {
      external: ["ethers5"],
    },
  },
});