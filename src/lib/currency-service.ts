// Multi-Currency Pricing Service for MobBitWallet
// This service handles currency conversion, exchange rates, and multi-currency pricing support

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
  source: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  decimalPlaces: number;
  isActive: boolean;
  isCrypto: boolean;
}

export interface Price {
  amount: number;
  currency: string;
  formatted: string;
}

export interface MultiCurrencyPrice {
  baseCurrency: string;
  baseAmount: number;
  prices: Record<string, Price>;
  lastUpdated: string;
}

export interface CurrencyConfig {
  defaultCurrency: string;
  supportedCurrencies: string[];
  autoUpdate: boolean;
  updateInterval: number; // minutes
  preferredExchangeRateProvider: string;
}

class CurrencyService {
  private exchangeRates: Map<string, ExchangeRate> = new Map();
  private currencies: Map<string, Currency> = new Map();
  private config: CurrencyConfig;
  private updateTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      defaultCurrency: 'USD',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'BTC', 'ETH'],
      autoUpdate: true,
      updateInterval: 5, // 5 minutes
      preferredExchangeRateProvider: 'coingecko'
    };

    this.initializeCurrencies();
    this.initializeExchangeRates();
    this.startAutoUpdate();
  }

  /**
   * Initialize supported currencies
   */
  private initializeCurrencies(): void {
    const currencies: Currency[] = [
      // Fiat currencies
      { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimalPlaces: 2, isActive: true, isCrypto: false },
      { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimalPlaces: 2, isActive: true, isCrypto: false },
      { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimalPlaces: 2, isActive: true, isCrypto: false },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', decimalPlaces: 0, isActive: true, isCrypto: false },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', decimalPlaces: 2, isActive: true, isCrypto: false },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', decimalPlaces: 2, isActive: true, isCrypto: false },
      
      // Cryptocurrencies
      { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '🟧', decimalPlaces: 8, isActive: true, isCrypto: true },
      { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: '🔷', decimalPlaces: 18, isActive: true, isCrypto: true },
      { code: 'LTC', name: 'Litecoin', symbol: 'Ł', flag: '🔵', decimalPlaces: 8, isActive: true, isCrypto: true },
      { code: 'BCH', name: 'Bitcoin Cash', symbol: '₿', flag: '🟢', decimalPlaces: 8, isActive: true, isCrypto: true }
    ];

    currencies.forEach(currency => {
      this.currencies.set(currency.code, currency);
    });
  }

  /**
   * Initialize default exchange rates
   */
  private initializeExchangeRates(): void {
    const defaultRates: ExchangeRate[] = [
      // USD based rates
      { from: 'USD', to: 'EUR', rate: 0.85, timestamp: Date.now(), source: 'initial' },
      { from: 'USD', to: 'GBP', rate: 0.73, timestamp: Date.now(), source: 'initial' },
      { from: 'USD', to: 'JPY', rate: 110.0, timestamp: Date.now(), source: 'initial' },
      { from: 'USD', to: 'CAD', rate: 1.25, timestamp: Date.now(), source: 'initial' },
      { from: 'USD', to: 'AUD', rate: 1.35, timestamp: Date.now(), source: 'initial' },
      
      // Crypto rates (USD as base)
      { from: 'USD', to: 'BTC', rate: 0.000023, timestamp: Date.now(), source: 'initial' },
      { from: 'USD', to: 'ETH', rate: 0.00035, timestamp: Date.now(), source: 'initial' },
      { from: 'USD', to: 'LTC', rate: 0.0035, timestamp: Date.now(), source: 'initial' },
      { from: 'USD', to: 'BCH', rate: 0.00085, timestamp: Date.now(), source: 'initial' }
    ];

    defaultRates.forEach(rate => {
      this.exchangeRates.set(`${rate.from}_${rate.to}`, rate);
      
      // Add reverse rate
      const reverseRate: ExchangeRate = {
        from: rate.to,
        to: rate.from,
        rate: 1 / rate.rate,
        timestamp: rate.timestamp,
        source: rate.source
      };
      this.exchangeRates.set(`${rate.to}_${rate.from}`, reverseRate);
    });
  }

  /**
   * Start automatic exchange rate updates
   */
  private startAutoUpdate(): void {
    if (this.config.autoUpdate) {
      this.updateTimer = setInterval(() => {
        this.updateExchangeRates();
      }, this.config.updateInterval * 60 * 1000);
    }
  }

  /**
   * Update exchange rates from external API
   */
  private async updateExchangeRates(): Promise<void> {
    try {
      // In a real implementation, this would fetch from a real API
      // For demo purposes, we'll simulate rate changes
      this.simulateRateChanges();
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  /**
   * Simulate exchange rate changes for demo
   */
  private simulateRateChanges(): void {
    this.exchangeRates.forEach((rate, key) => {
      // Simulate small random changes
      const changePercent = (Math.random() - 0.5) * 0.02; // ±1% change
      const newRate = rate.rate * (1 + changePercent);
      
      const updatedRate: ExchangeRate = {
        ...rate,
        rate: newRate,
        timestamp: Date.now(),
        source: 'simulated'
      };
      
      this.exchangeRates.set(key, updatedRate);
    });
  }

  /**
   * Get exchange rate between two currencies
   */
  getExchangeRate(from: string, to: string): number | null {
    if (from === to) return 1.0;
    
    const directRate = this.exchangeRates.get(`${from}_${to}`);
    if (directRate) {
      return directRate.rate;
    }

    // Try to find rate through USD as base
    const fromToUsd = this.exchangeRates.get(`${from}_USD`);
    const usdToTo = this.exchangeRates.get(`USD_${to}`);
    
    if (fromToUsd && usdToTo) {
      return fromToUsd.rate * usdToTo.rate;
    }

    return null;
  }

  /**
   * Convert amount from one currency to another
   */
  convertAmount(amount: number, from: string, to: string): number | null {
    const rate = this.getExchangeRate(from, to);
    if (rate === null) return null;
    return amount * rate;
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number, currency: string): string {
    const currencyInfo = this.currencies.get(currency);
    if (!currencyInfo) return `${amount} ${currency}`;

    const roundedAmount = this.roundAmount(amount, currencyInfo.decimalPlaces);
    
    if (currencyInfo.isCrypto) {
      return `${roundedAmount} ${currency}`;
    } else {
      return `${currencyInfo.symbol}${roundedAmount}`;
    }
  }

  /**
   * Round amount based on currency decimal places
   */
  private roundAmount(amount: number, decimalPlaces: number): string {
    return amount.toFixed(decimalPlaces);
  }

  /**
   * Get multi-currency pricing for a base amount
   */
  getMultiCurrencyPrices(baseAmount: number, baseCurrency: string = 'USD'): MultiCurrencyPrice {
    const prices: Record<string, Price> = {};
    const supportedCurrencies = this.getSupportedCurrencies();

    supportedCurrencies.forEach(currency => {
      const convertedAmount = this.convertAmount(baseAmount, baseCurrency, currency);
      if (convertedAmount !== null) {
        prices[currency] = {
          amount: convertedAmount,
          currency,
          formatted: this.formatAmount(convertedAmount, currency)
        };
      }
    });

    return {
      baseCurrency,
      baseAmount,
      prices,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return Array.from(this.currencies.values()).filter(currency => 
      this.config.supportedCurrencies.includes(currency.code) && currency.isActive
    );
  }

  /**
   * Get currency information
   */
  getCurrency(currencyCode: string): Currency | null {
    return this.currencies.get(currencyCode) || null;
  }

  /**
   * Check if currency is supported
   */
  isCurrencySupported(currencyCode: string): boolean {
    return this.config.supportedCurrencies.includes(currencyCode) && 
           this.currencies.has(currencyCode);
  }

  /**
   * Add custom currency
   */
  addCustomCurrency(currency: Currency): boolean {
    if (this.currencies.has(currency.code)) {
      return false;
    }

    this.currencies.set(currency.code, currency);
    if (!this.config.supportedCurrencies.includes(currency.code)) {
      this.config.supportedCurrencies.push(currency.code);
    }
    return true;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CurrencyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart auto-update with new interval
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    this.startAutoUpdate();
  }

  /**
   * Get current configuration
   */
  getConfig(): CurrencyConfig {
    return { ...this.config };
  }

  /**
   * Get exchange rate history (mock implementation)
   */
  getExchangeRateHistory(from: string, to: string, days: number = 7): Array<{ date: string; rate: number }> {
    const history: Array<{ date: string; rate: number }> = [];
    const currentRate = this.getExchangeRate(from, to);
    
    if (currentRate === null) return history;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate historical rates with some variation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const historicalRate = currentRate * (1 + variation);
      
      history.push({
        date: date.toISOString().split('T')[0],
        rate: historicalRate
      });
    }

    return history;
  }

  /**
   * Calculate price volatility
   */
  calculateVolatility(currency: string, baseCurrency: string = 'USD', days: number = 30): number {
    const history = this.getExchangeRateHistory(currency, baseCurrency, days);
    if (history.length < 2) return 0;

    const rates = history.map(h => h.rate);
    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const squaredDiffs = rates.map(rate => Math.pow(rate - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / rates.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  /**
   * Get currency statistics
   */
  getCurrencyStats(currency: string, baseCurrency: string = 'USD') {
    const currentRate = this.getExchangeRate(currency, baseCurrency);
    const volatility = this.calculateVolatility(currency, baseCurrency);
    const history = this.getExchangeRateHistory(currency, baseCurrency, 1);
    
    const dayChange = history.length >= 2 ? 
      ((history[history.length - 1].rate - history[0].rate) / history[0].rate) * 100 : 0;

    return {
      currentRate,
      volatility,
      dayChange,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();