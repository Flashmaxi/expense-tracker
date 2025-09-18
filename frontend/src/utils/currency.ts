import { CurrencyInfo } from '../types';

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  RSD: { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  if (!currencyInfo) {
    return `${amount.toFixed(2)} ${currency}`;
  }

  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  switch (currency) {
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'RSD':
      return `${formatted} дин.`;
    default:
      return `${currencyInfo.symbol}${formatted}`;
  }
};

export const getCurrencySymbol = (currency: string): string => {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  return currencyInfo ? currencyInfo.symbol : currency;
};

export const formatSatoshis = (satoshis: number): string => {
  return `${satoshis.toLocaleString()} sats`;
};