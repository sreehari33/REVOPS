// Currency configuration
// All locales use 'en-US' so numbers always render in English digits
export const CURRENCIES = [
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee',        locale: 'en-US' },
  { code: 'QAR', symbol: 'QAR',  name: 'Qatari Riyal',        locale: 'en-US' },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham',          locale: 'en-US' },
  { code: 'SAR', symbol: 'SAR',  name: 'Saudi Riyal',         locale: 'en-US' },
  { code: 'KWD', symbol: 'KWD',  name: 'Kuwaiti Dinar',       locale: 'en-US' },
  { code: 'BHD', symbol: 'BHD',  name: 'Bahraini Dinar',      locale: 'en-US' },
  { code: 'OMR', symbol: 'OMR',  name: 'Omani Rial',          locale: 'en-US' },
  { code: 'JOD', symbol: 'JOD',  name: 'Jordanian Dinar',     locale: 'en-US' },
  { code: 'EGP', symbol: 'EGP',  name: 'Egyptian Pound',      locale: 'en-US' },
  { code: 'USD', symbol: '$',    name: 'US Dollar',           locale: 'en-US' },
  { code: 'EUR', symbol: '€',    name: 'Euro',                locale: 'en-US' },
  { code: 'GBP', symbol: '£',    name: 'British Pound',       locale: 'en-US' },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar',    locale: 'en-US' },
  { code: 'MYR', symbol: 'RM',   name: 'Malaysian Ringgit',   locale: 'en-US' },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar',   locale: 'en-US' },
  { code: 'CAD', symbol: 'C$',   name: 'Canadian Dollar',     locale: 'en-US' },
  { code: 'NZD', symbol: 'NZ$',  name: 'New Zealand Dollar',  locale: 'en-US' },
  { code: 'PKR', symbol: 'Rs',   name: 'Pakistani Rupee',     locale: 'en-US' },
  { code: 'BDT', symbol: 'Tk',   name: 'Bangladeshi Taka',    locale: 'en-US' },
  { code: 'LKR', symbol: 'Rs',   name: 'Sri Lankan Rupee',    locale: 'en-US' },
  { code: 'NPR', symbol: 'Rs',   name: 'Nepalese Rupee',      locale: 'en-US' },
  { code: 'THB', symbol: 'THB',  name: 'Thai Baht',           locale: 'en-US' },
  { code: 'IDR', symbol: 'Rp',   name: 'Indonesian Rupiah',   locale: 'en-US' },
  { code: 'PHP', symbol: 'PHP',  name: 'Philippine Peso',     locale: 'en-US' },
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand',  locale: 'en-US' },
  { code: 'NGN', symbol: 'NGN',  name: 'Nigerian Naira',      locale: 'en-US' },
  { code: 'KES', symbol: 'KSh',  name: 'Kenyan Shilling',     locale: 'en-US' },
  { code: 'JPY', symbol: 'JPY',  name: 'Japanese Yen',        locale: 'en-US' },
  { code: 'CNY', symbol: 'CNY',  name: 'Chinese Yuan',        locale: 'en-US' },
  { code: 'KRW', symbol: 'KRW',  name: 'South Korean Won',    locale: 'en-US' },
  { code: 'TRY', symbol: 'TRY',  name: 'Turkish Lira',        locale: 'en-US' },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real',      locale: 'en-US' },
  { code: 'MXN', symbol: 'MXN',  name: 'Mexican Peso',        locale: 'en-US' },
  { code: 'CHF', symbol: 'Fr',   name: 'Swiss Franc',         locale: 'en-US' },
  { code: 'SEK', symbol: 'kr',   name: 'Swedish Krona',       locale: 'en-US' },
  { code: 'NOK', symbol: 'kr',   name: 'Norwegian Krone',     locale: 'en-US' },
  { code: 'RUB', symbol: 'RUB',  name: 'Russian Ruble',       locale: 'en-US' },
];

export const DEFAULT_CURRENCY = 'INR';

export const getCurrencyByCode = (code) => {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES.find(c => c.code === DEFAULT_CURRENCY);
};

export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY) => {
  const currency = getCurrencyByCode(currencyCode);
  const num = parseFloat(amount) || 0;

  // JPY, KRW — no decimal places
  const noDecimals = ['JPY', 'KRW', 'IDR'];
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: noDecimals.includes(currency.code) ? 0 : 2,
    maximumFractionDigits: noDecimals.includes(currency.code) ? 0 : 2,
  });

  return `${currency.symbol} ${formatted}`;
};

export const getCurrencySymbol = (currencyCode = DEFAULT_CURRENCY) => {
  return getCurrencyByCode(currencyCode).symbol;
};
