// Currency configuration
export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', locale: 'en-IN' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', locale: 'ar-OM' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', locale: 'ar-KW' },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', locale: 'ar-BH' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'en-PK' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD' },
  { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee', locale: 'si-LK' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee', locale: 'ne-NP' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'sw-KE' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound', locale: 'ar-EG' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', locale: 'es-AR' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', locale: 'es-CL' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', locale: 'es-CO' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', locale: 'es-PE' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
];

export const DEFAULT_CURRENCY = 'INR';

export const getCurrencyByCode = (code) => {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES.find(c => c.code === DEFAULT_CURRENCY);
};

export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY) => {
  const currency = getCurrencyByCode(currencyCode);
  
  // For currencies with decimals
  if (['INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'AUD', 'CAD', 'SGD'].includes(currency.code)) {
    return `${currency.symbol}${parseFloat(amount).toLocaleString(currency.locale, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    })}`;
  }
  
  // For currencies without decimals (like JPY, KRW)
  return `${currency.symbol}${Math.round(amount).toLocaleString(currency.locale)}`;
};

export const getCurrencySymbol = (currencyCode = DEFAULT_CURRENCY) => {
  const currency = getCurrencyByCode(currencyCode);
  return currency.symbol;
};
