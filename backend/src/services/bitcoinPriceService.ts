import fetch from 'node-fetch';
import currencyService from './currencyService';

export interface BitcoinPrice {
  date: string;
  price: number;
  timestamp: number;
}

class BitcoinPriceService {
  private priceCache: Map<string, BitcoinPrice> = new Map();
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

  // Currencies directly supported by CoinGecko
  private readonly SUPPORTED_CURRENCIES = ['usd', 'eur', 'btc', 'eth', 'gbp', 'jpy', 'cny', 'krw'];

  // Check if currency is directly supported by CoinGecko
  private isDirectlySupported(currency: string): boolean {
    return this.SUPPORTED_CURRENCIES.includes(currency.toLowerCase());
  }

  // Get Bitcoin price for a specific date in specified currency
  async getBitcoinPriceForDate(date: string, currency: string = 'USD'): Promise<number> {
    try {
      const cacheKey = `${date}-${currency}`;

      // Check cache first
      if (this.priceCache.has(cacheKey)) {
        return this.priceCache.get(cacheKey)!.price;
      }

      let bitcoinPrice: number;

      if (this.isDirectlySupported(currency)) {
        // Get Bitcoin price directly from CoinGecko
        bitcoinPrice = await this.getBitcoinPriceDirectly(date, currency);
      } else {
        // For unsupported currencies like RSD, get USD price and convert
        const bitcoinPriceUSD = await this.getBitcoinPriceDirectly(date, 'USD');
        const exchangeRates = await currencyService.getExchangeRates();

        // Convert Bitcoin price from USD to target currency
        // 1 BTC = bitcoinPriceUSD USD
        // We need: 1 BTC = ? RSD
        if (currency.toUpperCase() === 'RSD') {
          bitcoinPrice = bitcoinPriceUSD * exchangeRates.RSD;
        } else {
          // For other unsupported currencies, fallback to USD
          bitcoinPrice = bitcoinPriceUSD;
        }
      }

      // Cache the result
      const bitcoinPriceObj: BitcoinPrice = {
        date: cacheKey,
        price: bitcoinPrice,
        timestamp: Date.now(),
      };
      this.priceCache.set(cacheKey, bitcoinPriceObj);

      return bitcoinPrice;
    } catch (error) {
      console.error(`Error fetching Bitcoin price for ${date} in ${currency}:`, error);
      // Return current price as fallback
      return await this.getCurrentBitcoinPrice(currency);
    }
  }

  // Get Bitcoin price directly from CoinGecko for supported currencies
  private async getBitcoinPriceDirectly(date: string, currency: string): Promise<number> {
    // Format date for CoinGecko API (DD-MM-YYYY)
    const dateObj = new Date(date);
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;

    const response = await fetch(
      `${this.COINGECKO_API}/coins/bitcoin/history?date=${formattedDate}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Bitcoin price: ${response.statusText}`);
    }

    const data: any = await response.json();
    const currencyLower = currency.toLowerCase();
    const price = data.market_data?.current_price?.[currencyLower];

    if (!price) {
      throw new Error(`Bitcoin price not found for currency ${currency}`);
    }

    return price;
  }

  // Get current Bitcoin price in specified currency
  async getCurrentBitcoinPrice(currency: string = 'USD'): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `${today}-${currency}`;

      // Check if we have today's price cached
      if (this.priceCache.has(cacheKey)) {
        const cached = this.priceCache.get(cacheKey)!;
        // If cached price is less than 1 hour old, use it
        if (Date.now() - cached.timestamp < 3600000) {
          return cached.price;
        }
      }

      let bitcoinPrice: number;

      if (this.isDirectlySupported(currency)) {
        // Get Bitcoin price directly from CoinGecko
        const currencyLower = currency.toLowerCase();
        const response = await fetch(
          `${this.COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=${currencyLower}`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch current Bitcoin price: ${response.statusText}`);
        }

        const data: any = await response.json();
        const price = data.bitcoin?.[currencyLower];

        if (!price) {
          throw new Error(`Current Bitcoin price not found for currency ${currency}`);
        }

        bitcoinPrice = price;
      } else {
        // For unsupported currencies like RSD, get USD price and convert
        const bitcoinPriceUSD = await this.getCurrentBitcoinPriceDirectly('USD');
        const exchangeRates = await currencyService.getExchangeRates();

        // Convert Bitcoin price from USD to target currency
        if (currency.toUpperCase() === 'RSD') {
          bitcoinPrice = bitcoinPriceUSD * exchangeRates.RSD;
        } else {
          // For other unsupported currencies, fallback to USD
          bitcoinPrice = bitcoinPriceUSD;
        }
      }

      // Cache the current price
      const bitcoinPriceObj: BitcoinPrice = {
        date: cacheKey,
        price: bitcoinPrice,
        timestamp: Date.now(),
      };
      this.priceCache.set(cacheKey, bitcoinPriceObj);

      return bitcoinPrice;
    } catch (error) {
      console.error(`Error fetching current Bitcoin price in ${currency}:`, error);
      // Return fallback prices based on currency
      const fallbackPrices: { [key: string]: number } = {
        'USD': 45000,
        'EUR': 41000,
        'RSD': 4950000, // Approximate fallback
      };
      return fallbackPrices[currency.toUpperCase()] || 45000;
    }
  }

  // Get current Bitcoin price directly from CoinGecko for supported currencies
  private async getCurrentBitcoinPriceDirectly(currency: string): Promise<number> {
    const currencyLower = currency.toLowerCase();
    const response = await fetch(
      `${this.COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=${currencyLower}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch current Bitcoin price: ${response.statusText}`);
    }

    const data: any = await response.json();
    const price = data.bitcoin?.[currencyLower];

    if (!price) {
      throw new Error(`Current Bitcoin price not found for currency ${currency}`);
    }

    return price;
  }

  // Convert any currency amount to satoshis
  currencyToSatoshis(amount: number, bitcoinPriceInCurrency: number): number {
    const SATOSHIS_PER_BTC = 100000000; // 100 million satoshis = 1 BTC
    const btcAmount = amount / bitcoinPriceInCurrency;
    return Math.round(btcAmount * SATOSHIS_PER_BTC);
  }

  // Convert satoshis to any currency
  satoshisToCurrency(satoshis: number, bitcoinPriceInCurrency: number): number {
    const SATOSHIS_PER_BTC = 100000000;
    const btcAmount = satoshis / SATOSHIS_PER_BTC;
    return btcAmount * bitcoinPriceInCurrency;
  }

  // Backward compatibility - Convert USD to satoshis
  usdToSatoshis(usdAmount: number, bitcoinPriceUsd: number): number {
    return this.currencyToSatoshis(usdAmount, bitcoinPriceUsd);
  }

  // Backward compatibility - Convert satoshis to USD
  satoshisToUsd(satoshis: number, bitcoinPriceUsd: number): number {
    return this.satoshisToCurrency(satoshis, bitcoinPriceUsd);
  }

  // Format satoshis with proper units
  formatSatoshis(satoshis: number): string {
    if (satoshis >= 100000000) {
      // 1 BTC or more
      const btc = satoshis / 100000000;
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
  }
}

export default new BitcoinPriceService();