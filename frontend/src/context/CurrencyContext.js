import React, { createContext, useContext, useState, useEffect } from 'react';
import { workshopAPI } from '@/services/api';
import { getCurrencyByCode, DEFAULT_CURRENCY } from '@/utils/currency';

const CurrencyContext = createContext(null);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: getCurrencyByCode(DEFAULT_CURRENCY),
      loading: false
    };
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(getCurrencyByCode(DEFAULT_CURRENCY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrency();
  }, []);

  const fetchCurrency = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await workshopAPI.getMy();
        const workshopCurrency = response.data.currency || DEFAULT_CURRENCY;
        setCurrency(getCurrencyByCode(workshopCurrency));
      }
    } catch (error) {
      console.log('Using default currency');
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = (currencyCode) => {
    setCurrency(getCurrencyByCode(currencyCode));
  };

  return (
    <CurrencyContext.Provider value={{ currency, loading, updateCurrency, refreshCurrency: fetchCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
