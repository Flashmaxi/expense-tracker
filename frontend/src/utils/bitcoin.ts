// Bitcoin utility functions for the frontend

export const SATOSHIS_PER_BTC = 100000000; // 100 million satoshis = 1 BTC

// Convert USD to satoshis
export const usdToSatoshis = (usdAmount: number, bitcoinPriceUsd: number): number => {
  const btcAmount = usdAmount / bitcoinPriceUsd;
  return Math.round(btcAmount * SATOSHIS_PER_BTC);
};

// Convert satoshis to USD
export const satoshisToUsd = (satoshis: number, bitcoinPriceUsd: number): number => {
  const btcAmount = satoshis / SATOSHIS_PER_BTC;
  return btcAmount * bitcoinPriceUsd;
};

// Format satoshis with proper units
export const formatSatoshis = (satoshis: number): string => {
  if (satoshis >= SATOSHIS_PER_BTC) {
    // 1 BTC or more
    const btc = satoshis / SATOSHIS_PER_BTC;
    return `₿${btc.toFixed(8)}`;
  } else if (satoshis >= 1000000) {
    // 1M sats or more, show in millions
    const millions = satoshis / 1000000;
    return `${millions.toFixed(2)}M sats`;
  } else if (satoshis >= 1000) {
    // 1K sats or more, show in thousands
    const thousands = satoshis / 1000;
    return `${thousands.toFixed(1)}K sats`;
  } else {
    // Less than 1K, show individual sats
    return `${satoshis.toLocaleString()} sats`;
  }
};

// Format Bitcoin price
export const formatBitcoinPrice = (price: number): string => {
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

// Get Bitcoin price color indicator
export const getBitcoinPriceColor = (currentPrice: number, historicalPrice: number): string => {
  if (currentPrice > historicalPrice) {
    return 'text-green-600';
  } else if (currentPrice < historicalPrice) {
    return 'text-red-600';
  }
  return 'text-gray-600';
};