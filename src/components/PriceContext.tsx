import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { priceFetcher } from '../components/priceUtils';

interface PriceData {
    TUSDTperTITC: string;
    TITCperTUSDT: string;
}

interface PriceContextType {
    priceData: PriceData | null;
    loading: boolean;
    error: string | null;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

interface PriceProviderProps {
    children: ReactNode;
}

export const PriceProvider: React.FC<PriceProviderProps> = ({ children }) => {
    const [priceData, setPriceData] = useState<PriceData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        let intervalId: NodeJS.Timeout;

        const fetchAndUpdatePrice = async () => {
            try {
                const data = await priceFetcher.fetchPrice();
                if (mounted) {
                    setPriceData(data);
                    setLoading(false);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    setError((err as Error).message);
                    setLoading(false);
                }
            }
        };

        fetchAndUpdatePrice();
        intervalId = setInterval(fetchAndUpdatePrice, 10000);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, []);

    return (
        <PriceContext.Provider value={{ priceData, loading, error }}>
            {children}
        </PriceContext.Provider>
    );
};

export const usePriceData = (): PriceContextType => {
    const context = useContext(PriceContext);
    if (!context) {
        throw new Error('usePriceData must be used within a PriceProvider');
    }
    return context;
};
