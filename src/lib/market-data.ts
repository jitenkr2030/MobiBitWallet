// Market Data Service for MobBitWallet
// This service handles cryptocurrency price data from CoinGecko API

export interface MarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply?: number;
  max_supply?: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

export interface PortfolioValue {
  total_value_usd: number;
  total_value_btc: number;
  assets: Array<{
    symbol: string;
    balance: number;
    value_usd: number;
    value_btc: number;
    price_change_24h: number;
  }>;
}

export interface MarketChart {
  prices: Array<[number, number]>; // [timestamp, price]
  market_caps: Array<[number, number]>;
  total_volumes: Array<[number, number]>;
}

class MarketDataService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get current market data for a specific cryptocurrency
   */
  async getMarketData(coinId: string = 'bitcoin'): Promise<MarketData> {
    const cacheKey = `market_data_${coinId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to our interface
      const marketData: MarketData = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image,
        current_price: data.market_data.current_price.usd,
        market_cap: data.market_data.market_cap.usd,
        market_cap_rank: data.market_cap_rank,
        fully_diluted_valuation: data.market_data.fully_diluted_valuation?.usd,
        total_volume: data.market_data.total_volume.usd,
        high_24h: data.market_data.high_24h.usd,
        low_24h: data.market_data.low_24h.usd,
        price_change_24h: data.market_data.price_change_24h,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        market_cap_change_24h: data.market_data.market_cap_change_24h,
        market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
        circulating_supply: data.market_data.circulating_supply,
        total_supply: data.market_data.total_supply,
        max_supply: data.market_data.max_supply,
        ath: data.market_data.ath.usd,
        ath_change_percentage: data.market_data.ath_change_percentage.usd,
        ath_date: data.market_data.ath_date.usd,
        atl: data.market_data.atl.usd,
        atl_change_percentage: data.market_data.atl_change_percentage.usd,
        atl_date: data.market_data.atl_date.usd,
        last_updated: data.last_updated
      };

      this.cache.set(cacheKey, { data: marketData, timestamp: Date.now() });
      return marketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Return mock data for development
      return this.getMockMarketData(coinId);
    }
  }

  /**
   * Get market data for multiple cryptocurrencies
   */
  async getMultipleMarketData(coinIds: string[] = ['bitcoin', 'ethereum']): Promise<MarketData[]> {
    const cacheKey = `multiple_market_data_${coinIds.join(',')}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const marketData: MarketData[] = data.map((item: any) => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        image: item.image,
        current_price: item.current_price,
        market_cap: item.market_cap,
        market_cap_rank: item.market_cap_rank,
        fully_diluted_valuation: item.fully_diluted_valuation,
        total_volume: item.total_volume,
        high_24h: item.high_24h,
        low_24h: item.low_24h,
        price_change_24h: item.price_change_24h,
        price_change_percentage_24h: item.price_change_percentage_24h,
        market_cap_change_24h: item.market_cap_change_24h,
        market_cap_change_percentage_24h: item.market_cap_change_percentage_24h,
        circulating_supply: item.circulating_supply,
        total_supply: item.total_supply,
        max_supply: item.max_supply,
        ath: item.ath,
        ath_change_percentage: item.ath_change_percentage,
        ath_date: item.ath_date,
        atl: item.atl,
        atl_change_percentage: item.atl_change_percentage,
        atl_date: item.atl_date,
        last_updated: item.last_updated
      }));

      this.cache.set(cacheKey, { data: marketData, timestamp: Date.now() });
      return marketData;
    } catch (error) {
      console.error('Error fetching multiple market data:', error);
      // Return mock data for development
      return coinIds.map(coinId => this.getMockMarketData(coinId));
    }
  }

  /**
   * Get price history for a cryptocurrency
   */
  async getPriceHistory(
    coinId: string = 'bitcoin',
    days: number = 7,
    vsCurrency: string = 'usd'
  ): Promise<PriceHistory[]> {
    const cacheKey = `price_history_${coinId}_${days}_${vsCurrency}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const priceHistory: PriceHistory[] = data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price
      }));

      this.cache.set(cacheKey, { data: priceHistory, timestamp: Date.now() });
      return priceHistory;
    } catch (error) {
      console.error('Error fetching price history:', error);
      // Return mock data for development
      return this.getMockPriceHistory(days);
    }
  }

  /**
   * Get market chart data
   */
  async getMarketChart(
    coinId: string = 'bitcoin',
    days: number = 7,
    vsCurrency: string = 'usd'
  ): Promise<MarketChart> {
    const cacheKey = `market_chart_${coinId}_${days}_${vsCurrency}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const marketChart: MarketChart = {
        prices: data.prices,
        market_caps: data.market_caps,
        total_volumes: data.total_volumes
      };

      this.cache.set(cacheKey, { data: marketChart, timestamp: Date.now() });
      return marketChart;
    } catch (error) {
      console.error('Error fetching market chart:', error);
      // Return mock data for development
      return this.getMockMarketChart(days);
    }
  }

  /**
   * Calculate portfolio value
   */
  async calculatePortfolioValue(balances: Record<string, number>): Promise<PortfolioValue> {
    try {
      const coinIds = Object.keys(balances);
      const marketDataList = await this.getMultipleMarketData(coinIds);
      
      let totalValueUsd = 0;
      let totalValueBtc = 0;
      
      const btcPrice = marketDataList.find(m => m.symbol === 'btc')?.current_price || 1;
      
      const assets = marketDataList.map(marketData => {
        const balance = balances[marketData.id] || 0;
        const valueUsd = balance * marketData.current_price;
        const valueBtc = valueUsd / btcPrice;
        
        totalValueUsd += valueUsd;
        totalValueBtc += valueBtc;
        
        return {
          symbol: marketData.symbol.toUpperCase(),
          balance,
          value_usd: valueUsd,
          value_btc: valueBtc,
          price_change_24h: marketData.price_change_percentage_24h
        };
      });

      return {
        total_value_usd: totalValueUsd,
        total_value_btc: totalValueBtc,
        assets
      };
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
      // Return mock data for development
      return this.getMockPortfolioValue(balances);
    }
  }

  /**
   * Get top cryptocurrencies by market cap
   */
  async getTopCryptocurrencies(limit: number = 10): Promise<MarketData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.map((item: any) => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        image: item.image,
        current_price: item.current_price,
        market_cap: item.market_cap,
        market_cap_rank: item.market_cap_rank,
        fully_diluted_valuation: item.fully_diluted_valuation,
        total_volume: item.total_volume,
        high_24h: item.high_24h,
        low_24h: item.low_24h,
        price_change_24h: item.price_change_24h,
        price_change_percentage_24h: item.price_change_percentage_24h,
        market_cap_change_24h: item.market_cap_change_24h,
        market_cap_change_percentage_24h: item.market_cap_change_percentage_24h,
        circulating_supply: item.circulating_supply,
        total_supply: item.total_supply,
        max_supply: item.max_supply,
        ath: item.ath,
        ath_change_percentage: item.ath_change_percentage,
        ath_date: item.ath_date,
        atl: item.atl,
        atl_change_percentage: item.atl_change_percentage,
        atl_date: item.atl_date,
        last_updated: item.last_updated
      }));
    } catch (error) {
      console.error('Error fetching top cryptocurrencies:', error);
      // Return mock data for development
      return this.getMockTopCryptocurrencies(limit);
    }
  }

  /**
   * Search for cryptocurrencies
   */
  async searchCryptocurrencies(query: string): Promise<MarketData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const coins = data.coins.slice(0, 10); // Limit to 10 results
      
      return coins.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.large,
        current_price: 0, // Will need to fetch full data for price
        market_cap: 0,
        market_cap_rank: coin.market_cap_rank,
        total_volume: 0,
        high_24h: 0,
        low_24h: 0,
        price_change_24h: 0,
        price_change_percentage_24h: 0,
        market_cap_change_24h: 0,
        market_cap_change_percentage_24h: 0,
        circulating_supply: 0,
        ath: 0,
        ath_change_percentage: 0,
        ath_date: '',
        atl: 0,
        atl_change_percentage: 0,
        atl_date: '',
        last_updated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error searching cryptocurrencies:', error);
      return [];
    }
  }

  // Mock data methods for development/fallback
  private getMockMarketData(coinId: string): MarketData {
    const basePrice = coinId === 'bitcoin' ? 43250 : coinId === 'ethereum' ? 2580 : 100;
    const change = (Math.random() - 0.5) * 10; // -5% to +5%
    
    return {
      id: coinId,
      symbol: coinId === 'bitcoin' ? 'BTC' : coinId === 'ethereum' ? 'ETH' : coinId.toUpperCase(),
      name: coinId === 'bitcoin' ? 'Bitcoin' : coinId === 'ethereum' ? 'Ethereum' : coinId.charAt(0).toUpperCase() + coinId.slice(1),
      image: `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`,
      current_price: basePrice * (1 + change / 100),
      market_cap: basePrice * 19_000_000,
      market_cap_rank: coinId === 'bitcoin' ? 1 : coinId === 'ethereum' ? 2 : 10,
      total_volume: basePrice * 1_000_000,
      high_24h: basePrice * 1.02,
      low_24h: basePrice * 0.98,
      price_change_24h: basePrice * change / 100,
      price_change_percentage_24h: change,
      market_cap_change_24h: basePrice * 100_000,
      market_cap_change_percentage_24h: change,
      circulating_supply: coinId === 'bitcoin' ? 19_000_000 : coinId === 'ethereum' ? 120_000_000 : 1_000_000_000,
      ath: basePrice * 1.5,
      ath_change_percentage: 50,
      ath_date: '2021-11-10T14:24:11.849Z',
      atl: basePrice * 0.1,
      atl_change_percentage: -90,
      atl_date: '2015-10-20T00:00:00.000Z',
      last_updated: new Date().toISOString()
    };
  }

  private getMockPriceHistory(days: number): PriceHistory[] {
    const data: PriceHistory[] = [];
    const now = Date.now();
    const basePrice = 43250;
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation);
      
      data.push({ timestamp, price });
    }
    
    return data;
  }

  private getMockMarketChart(days: number): MarketChart {
    const prices: Array<[number, number]> = [];
    const marketCaps: Array<[number, number]> = [];
    const totalVolumes: Array<[number, number]> = [];
    const now = Date.now();
    const basePrice = 43250;
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + variation);
      
      prices.push([timestamp, price]);
      marketCaps.push([timestamp, price * 19_000_000]);
      totalVolumes.push([timestamp, price * 1_000_000]);
    }
    
    return { prices, market_caps, total_volumes: totalVolumes };
  }

  private getMockPortfolioValue(balances: Record<string, number>): PortfolioValue {
    const assets = Object.entries(balances).map(([coinId, balance]) => {
      const basePrice = coinId === 'bitcoin' ? 43250 : coinId === 'ethereum' ? 2580 : 100;
      const change = (Math.random() - 0.5) * 10;
      const price = basePrice * (1 + change / 100);
      const valueUsd = balance * price;
      const valueBtc = valueUsd / 43250;
      
      return {
        symbol: coinId === 'bitcoin' ? 'BTC' : coinId === 'ethereum' ? 'ETH' : coinId.toUpperCase(),
        balance,
        value_usd: valueUsd,
        value_btc: valueBtc,
        price_change_24h: change
      };
    });
    
    const totalValueUsd = assets.reduce((sum, asset) => sum + asset.value_usd, 0);
    const totalValueBtc = assets.reduce((sum, asset) => sum + asset.value_btc, 0);
    
    return {
      total_value_usd: totalValueUsd,
      total_value_btc: totalValueBtc,
      assets
    };
  }

  private getMockTopCryptocurrencies(limit: number): MarketData[] {
    const cryptocurrencies = [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', basePrice: 43250 },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', basePrice: 2580 },
      { id: 'tether', symbol: 'USDT', name: 'Tether', basePrice: 1 },
      { id: 'binancecoin', symbol: 'BNB', name: 'BNB', basePrice: 315 },
      { id: 'solana', symbol: 'SOL', name: 'Solana', basePrice: 98 },
      { id: 'ripple', symbol: 'XRP', name: 'Ripple', basePrice: 0.62 },
      { id: 'usd-coin', symbol: 'USDC', name: 'USD Coin', basePrice: 1 },
      { id: 'staked-ether', symbol: 'STETH', name: 'Lido Staked Ether', basePrice: 2585 },
      { id: 'cardano', symbol: 'ADA', name: 'Cardano', basePrice: 0.48 },
      { id: 'avalanche', symbol: 'AVAX', name: 'Avalanche', basePrice: 35 }
    ];
    
    return cryptocurrencies.slice(0, limit).map((crypto, index) => {
      const change = (Math.random() - 0.5) * 10;
      const price = crypto.basePrice * (1 + change / 100);
      
      return {
        ...crypto,
        image: `https://assets.coingecko.com/coins/images/1/large/${crypto.id}.png`,
        current_price: price,
        market_cap: price * (crypto.basePrice * 1_000_000),
        market_cap_rank: index + 1,
        total_volume: price * 100_000,
        high_24h: price * 1.02,
        low_24h: price * 0.98,
        price_change_24h: price * change / 100,
        price_change_percentage_24h: change,
        market_cap_change_24h: price * 10_000,
        market_cap_change_percentage_24h: change,
        circulating_supply: crypto.basePrice * 1_000_000,
        ath: price * 1.5,
        ath_change_percentage: 50,
        ath_date: '2021-11-10T14:24:11.849Z',
        atl: price * 0.1,
        atl_change_percentage: -90,
        atl_date: '2015-10-20T00:00:00.000Z',
        last_updated: new Date().toISOString()
      };
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(amount);
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  /**
   * Format large numbers
   */
  static formatNumber(num: number): string {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();