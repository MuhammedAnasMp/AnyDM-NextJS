export const SUPPORTED_CURRENCIES = [
  { code: 'INR', label: 'INR (₹)', symbol: '₹' },
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'KWD', label: 'KWD (KWD)', symbol: 'KWD' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'AED', label: 'AED (AED)', symbol: 'AED' },
  { code: 'SAR', label: 'SAR (SAR)', symbol: 'SAR' },
  { code: 'BHD', label: 'BHD (BHD)', symbol: 'BHD' },
  { code: 'OMR', label: 'OMR (OMR)', symbol: 'OMR' },
  { code: 'QAR', label: 'QAR (QAR)', symbol: 'QAR' },
];

export const getCurrencySymbol = (currencyCode?: string): string => {
  if (!currencyCode) return 'INR';
  const found = SUPPORTED_CURRENCIES.find(
    c => c.code.toLowerCase() === currencyCode.toLowerCase() || c.symbol === currencyCode
  );
  return found ? found.code : currencyCode;
};

export const formatPrice = (price?: number | string | null, currencyCode?: string): string => {
  if (price === null || price === undefined || price === '') return '—';
  const curr = currencyCode || 'INR';
  return `${price} ${curr}`;
};
