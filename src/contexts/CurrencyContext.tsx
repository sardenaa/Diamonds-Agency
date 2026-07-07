import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyConfig, AppLanguage } from '../types.js';

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  currencies: CurrencyConfig[];
  toLocalPrice: (usdPrice: number) => number;
  formatLocalPrice: (usdPrice: number, lang?: AppLanguage) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  lang: AppLanguage;
}

export function CurrencyProvider({ children, lang }: CurrencyProviderProps) {
  const [currency, setCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState<CurrencyConfig[]>([
    { code: 'USD', symbol: '$', rateToUSD: 1 },
    { code: 'EUR', symbol: '€', rateToUSD: 0.92 },
    { code: 'GBP', symbol: '£', rateToUSD: 0.79 },
    { code: 'EGP', symbol: 'EGP ', rateToUSD: 48.15 },
    { code: 'SAR', symbol: 'SAR ', rateToUSD: 3.75 },
    { code: 'AED', symbol: 'AED ', rateToUSD: 3.67 }
  ]);

  useEffect(() => {
    const fetchInitialRates = async () => {
      try {
        const response = await fetch('/api/currencies');
        if (response.ok) {
          const data = await response.json();
          setCurrencies(data);
        }
      } catch (err) {
        console.error('Failed to load initial rates from live feed:', err);
      }
    };
    fetchInitialRates();
  }, []);

  const toLocalPrice = (usdPrice: number): number => {
    const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
    return parseFloat((usdPrice * activeCurrency.rateToUSD).toFixed(2));
  };

  const formatLocalPrice = (usdPrice: number, overrideLang?: AppLanguage): string => {
    const activeCurrency = currencies.find(c => c.code === currency) || currencies[0];
    const price = toLocalPrice(usdPrice);
    const currentLang = overrideLang || lang;
    return currentLang === 'ar'
      ? `${price} ${activeCurrency.symbol}`
      : `${activeCurrency.symbol}${price}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencies,
        toLocalPrice,
        formatLocalPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
