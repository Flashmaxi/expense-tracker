import fetch from 'node-fetch';

export interface BitcoinPrice {
  date: string;
  price: number;
  timestamp: number;
}

class BitcoinPriceService {
  private priceCache: Map<string, BitcoinPrice> = new Map();
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

  // Get Bitcoin price for a specific date
  async getBitcoinPriceForDate(date: string): Promise<number> {
    try {
      // Check cache first
      if (this.priceCache.has(date)) {
        return this.priceCache.get(date)!.price;
      }

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
      const price = data.market_data?.current_price?.usd;

      if (!price) {
        throw new Error('Bitcoin price not found in response');
      }

      // Cache the result
      const bitcoinPrice: BitcoinPrice = {
        date,
        price,
        timestamp: Date.now(),
      };
      this.priceCache.set(date, bitcoinPrice);

      return price;
    } catch (error) {
      console.error(`Error fetching Bitcoin price for ${date}:`, error);
      // Return current price as fallback
      return await this.getCurrentBitcoinPrice();
    }
  }

  // Get current Bitcoin price
  async getCurrentBitcoinPrice(): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if we have today's price cached
      if (this.priceCache.has(today)) {
        const cached = this.priceCache.get(today)!;
        // If cached price is less than 1 hour old, use it
        if (Date.now() - cached.timestamp < 3600000) {
          return cached.price;
        }
      }

      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`,
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
      const price = data.bitcoin?.usd;

      if (!price) {
        throw new Error('Current Bitcoin price not found in response');
      }

      // Cache the current price
      const bitcoinPrice: BitcoinPrice = {
        date: today,
        price,
        timestamp: Date.now(),
      };
      this.priceCache.set(today, bitcoinPrice);

      return price;
    } catch (error) {
      console.error('Error fetching current Bitcoin price:', error);
      // Return a fallback price (approximate current price)
      return 45000; // Fallback price in USD
    }
  }

  // Convert USD to satoshis
  usdToSatoshis(usdAmount: number, bitcoinPriceUsd: number): number {
    const SATOSHIS_PER_BTC = 100000000; // 100 million satoshis = 1 BTC
    const btcAmount = usdAmount / bitcoinPriceUsd;
    return Math.round(btcAmount * SATOSHIS_PER_BTC);
  }

  // Convert satoshis to USD
  satoshisToUsd(satoshis: number, bitcoinPriceUsd: number): number {
    const SATOSHIS_PER_BTC = 100000000;
    const btcAmount = satoshis / SATOSHIS_PER_BTC;
    return btcAmount * bitcoinPriceUsd;
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