import { ethers,Contract } from 'ethers';
import Decimal from 'decimal.js';

const POOL_ADDRESS: string = "0x2a29C450523bC6c5DA021F08F06bc9E9Cb906ef3";
const BSC_TESTNET_RPC: string = "https://data-seed-prebsc-1-s1.binance.org:8545";

const POOL_ABI: string[] = [
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
    "function liquidity() external view returns (uint128)",
];

interface Slot0Response {
    sqrtPriceX96: bigint;
}

interface PriceData {
    TUSDTperTITC: string;
    TITCperTUSDT: string;
}

class ITCPriceFetcher {
    private provider: ethers.providers.JsonRpcProvider;
    private poolContract: Contract;

    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(BSC_TESTNET_RPC);
        this.poolContract = new Contract(POOL_ADDRESS, POOL_ABI, this.provider);
    }

    async fetchPrice(): Promise<PriceData> {
        try {
            // Fetch data
            const { sqrtPriceX96 }: Slot0Response = await this.poolContract.slot0();

            // Calculate price
            const sqrtPrice = new Decimal(sqrtPriceX96.toString());
            const numerator = sqrtPrice.pow(2);
            const denominator = new Decimal(2).pow(192);
            const priceToken1PerToken0 = numerator.div(denominator);
            const priceToken0PerToken1 = new Decimal(1).div(priceToken1PerToken0);

            return {
                TUSDTperTITC: priceToken1PerToken0.toFixed(8),
                TITCperTUSDT: priceToken0PerToken1.toFixed(8),
            };
        } catch (error) {
            console.error("Error fetching price:", error);
            throw error;
        }
    }
}

export const priceFetcher = new ITCPriceFetcher();
