import fetch from 'node-fetch';

export interface ExchangeRates {
  USD: number;
  EUR: number;
  RSD: number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

class CurrencyService {
  private ratesCache: { rates: ExchangeRates | null; timestamp: number } = {
    rates: null,
    timestamp: 0,
  };

  // Cache duration: 1 hour
  private readonly CACHE_DURATION = 3600000;

  // Supported currencies
  public readonly SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
    USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
    EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
    RSD: { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.' },
  };

  // Get exchange rates from a free API (exchangerate-api.com)
  async getExchangeRates(): Promise<ExchangeRates> {
    try {
      // Check cache first
      const now = Date.now();
      if (this.ratesCache.rates && (now - this.ratesCache.timestamp) < this.CACHE_DURATION) {
        return this.ratesCache.rates;
      }

      // Fetch fresh rates from USD base
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.statusText}`);
      }

      const data: any = await response.json();

      const rates: ExchangeRates = {
        USD: 1, // Base currency
        EUR: 1 / data.rates.EUR, // USD to EUR rate
        RSD: data.rates.RSD, // USD to RSD rate
      };

      // Cache the results
      this.ratesCache = {
        rates,
        timestamp: now,
      };

      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);

      // Return fallback rates if API fails
      return {
        USD: 1,
        EUR: 0.85, // Approximate fallback rate
        RSD: 110,  // Approximate fallback rate
      };
    }
  }

  // Convert amount from one currency to another
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates();

    // Convert to USD first, then to target currency
    let usdAmount = amount;
    if (fromCurrency !== 'USD') {
      usdAmount = amount / rates[fromCurrency as keyof ExchangeRates];
    }

    if (toCurrency === 'USD') {
      return usdAmount;
    }

    return usdAmount * rates[toCurrency as keyof ExchangeRates];
  }

  // Convert any currency to USD for Bitcoin price calculation
  async convertToUSD(amount: number, fromCurrency: string): Promise<number> {
    return this.convertCurrency(amount, fromCurrency, 'USD');
  }

  // Format currency amount with proper symbol and formatting
  formatCurrency(amount: number, currency: string): string {
    const currencyInfo = this.SUPPORTED_CURRENCIES[currency];
    if (!currencyInfo) {
      return `${amount.toFixed(2)} ${currency}`;
    }

    const formatted = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Different positioning for different currencies
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
  }

  // Get currency symbol
  getCurrencySymbol(currency: string): string {
    const currencyInfo = this.SUPPORTED_CURRENCIES[currency];
    return currencyInfo ? currencyInfo.symbol : currency;
  }

  // Get currency name
  getCurrencyName(currency: string): string {
    const currencyInfo = this.SUPPORTED_CURRENCIES[currency];
    return currencyInfo ? currencyInfo.name : currency;
  }

  // Validate currency code
  isValidCurrency(currency: string): boolean {
    return currency in this.SUPPORTED_CURRENCIES;
  }
}

export default new CurrencyService();