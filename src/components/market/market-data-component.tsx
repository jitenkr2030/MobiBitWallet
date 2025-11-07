"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RefreshCw, 
  Search, 
  BarChart3, 
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  Clock
} from "lucide-react";
import { marketDataService, MarketData, PortfolioValue, PriceHistory } from "@/lib/market-data";

interface MarketDataComponentProps {
  walletBalances?: Record<string, number>;
  onPriceAlert?: (symbol: string, price: number) => void;
}

export function MarketDataComponent({ walletBalances = {}, onPriceAlert }: MarketDataComponentProps) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<PortfolioValue | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('7');
  const [topCryptos, setTopCryptos] = useState<MarketData[]>([]);

  useEffect(() => {
    loadMarketData();
    loadTopCryptos();
  }, []);

  useEffect(() => {
    if (Object.keys(walletBalances).length > 0) {
      loadPortfolioValue();
    }
  }, [walletBalances]);

  useEffect(() => {
    loadPriceHistory();
  }, [selectedCoin, timeRange]);

  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      const data = await marketDataService.getMultipleMarketData(['bitcoin', 'ethereum']);
      setMarketData(data);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfolioValue = async () => {
    try {
      const value = await marketDataService.calculatePortfolioValue(walletBalances);
      setPortfolioValue(value);
    } catch (error) {
      console.error('Error loading portfolio value:', error);
    }
  };

  const loadPriceHistory = async () => {
    try {
      const days = parseInt(timeRange);
      const history = await marketDataService.getPriceHistory(selectedCoin, days);
      setPriceHistory(history);
    } catch (error) {
      console.error('Error loading price history:', error);
    }
  };

  const loadTopCryptos = async () => {
    try {
      const data = await marketDataService.getTopCryptocurrencies(10);
      setTopCryptos(data);
    } catch (error) {
      console.error('Error loading top cryptocurrencies:', error);
    }
  };

  const handleRefresh = () => {
    marketDataService.clearCache();
    loadMarketData();
    loadPortfolioValue();
    loadPriceHistory();
    loadTopCryptos();
  };

  const formatCurrency = (amount: number) => {
    return marketDataService.formatCurrency(amount);
  };

  const formatPercentage = (value: number) => {
    return marketDataService.formatPercentage(value);
  };

  const formatNumber = (num: number) => {
    return marketDataService.formatNumber(num);
  };

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Market Data</h2>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Portfolio Overview */}
      {portfolioValue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Portfolio Overview</span>
            </CardTitle>
            <CardDescription>
              Your cryptocurrency portfolio value and performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value (USD)</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioValue.total_value_usd)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value (BTC)</p>
                      <p className="text-2xl font-bold">{portfolioValue.total_value_btc.toFixed(8)} BTC</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Assets</p>
                      <p className="text-2xl font-bold">{portfolioValue.assets.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Assets */}
            <div className="space-y-3">
              <h4 className="font-medium">Your Assets</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {portfolioValue.assets.map((asset, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{asset.symbol}</span>
                      <Badge className={getPriceChangeColor(asset.price_change_24h)}>
                        {formatPercentage(asset.price_change_24h)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Balance: {asset.balance.toFixed(8)}</div>
                      <div>Value: {formatCurrency(asset.value_usd)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Market Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Market Prices</span>
          </CardTitle>
          <CardDescription>
            Real-time cryptocurrency prices and market data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="prices" className="space-y-4">
            <TabsList>
              <TabsTrigger value="prices">Live Prices</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="top">Top Cryptos</TabsTrigger>
            </TabsList>

            {/* Live Prices Tab */}
            <TabsContent value="prices" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketData.map((crypto) => (
                  <Card key={crypto.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <span className="font-bold text-sm">{crypto.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{crypto.name}</div>
                            <div className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                        <Badge variant="outline">#{crypto.market_cap_rank}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{formatCurrency(crypto.current_price)}</span>
                          <div className={`flex items-center space-x-1 ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}>
                            {getPriceChangeIcon(crypto.price_change_percentage_24h)({ className: 'h-4 w-4' })}
                            <span className="font-medium">{formatPercentage(crypto.price_change_percentage_24h)}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Market Cap:</span>
                            <span className="ml-1 font-medium">{formatNumber(crypto.market_cap)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Volume 24h:</span>
                            <span className="ml-1 font-medium">{formatNumber(crypto.total_volume)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">High 24h:</span>
                            <span className="ml-1 font-medium">{formatCurrency(crypto.high_24h)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Low 24h:</span>
                            <span className="ml-1 font-medium">{formatCurrency(crypto.low_24h)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-4">
              {portfolioValue ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {portfolioValue.assets.map((asset, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold">{asset.symbol.charAt(0)}</span>
                                </div>
                                <span className="font-medium">{asset.symbol}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatCurrency(asset.value_usd)}</div>
                                <div className={`text-sm ${getPriceChangeColor(asset.price_change_24h)}`}>
                                  {formatPercentage(asset.price_change_24h)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Allocation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {portfolioValue.assets.map((asset, index) => {
                            const percentage = (asset.value_usd / portfolioValue.total_value_usd) * 100;
                            return (
                              <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{asset.symbol}</span>
                                  <span className="text-sm">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No portfolio data available</p>
                  <p className="text-sm">Add assets to your wallet to see portfolio analytics</p>
                </div>
              )}
            </TabsContent>

            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label>Cryptocurrency:</Label>
                  <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitcoin">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ethereum">Ethereum (ETH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Label>Time Range:</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">24 Hours</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Price Chart</CardTitle>
                  <CardDescription>
                    {selectedCoin === 'bitcoin' ? 'Bitcoin' : 'Ethereum'} price over the last {timeRange} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Price chart would be displayed here</p>
                      <p className="text-sm">In a real implementation, this would show an interactive price chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Cryptos Tab */}
            <TabsContent value="top" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
                {topCryptos
                  .filter(crypto => 
                    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((crypto, index) => (
                    <Card key={crypto.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <span className="font-bold text-sm">{crypto.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium">{crypto.name}</div>
                              <div className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(crypto.current_price)}</div>
                            <div className={`flex items-center space-x-1 ${getPriceChangeColor(crypto.price_change_percentage_24h)}`}>
                              {getPriceChangeIcon(crypto.price_change_percentage_24h)({ className: 'h-3 w-3' })}
                              <span className="text-sm">{formatPercentage(crypto.price_change_percentage_24h)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Market Cap:</span>
                            <div className="font-medium">{formatNumber(crypto.market_cap)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Volume:</span>
                            <div className="font-medium">{formatNumber(crypto.total_volume)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rank:</span>
                            <div className="font-medium">#{crypto.market_cap_rank}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Market Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          Market data is provided by CoinGecko API. Prices are updated every 5 minutes. 
          Always verify prices before making important financial decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}