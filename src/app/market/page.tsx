"use client";

import { useState } from "react";
import { MarketDataComponent } from "@/components/market/market-data-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, CheckCircle, ArrowLeft, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Clock } from "lucide-react";

export default function MarketPage() {
  const [walletBalances] = useState({
    bitcoin: 0.02345678,
    ethereum: 1.5
  });

  const handlePriceAlert = (symbol: string, price: number) => {
    console.log(`Price alert for ${symbol}: ${price}`);
    // In a real app, this would set up price alerts
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <a href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Market Data</h1>
            <p className="text-muted-foreground">
              Real-time cryptocurrency prices and portfolio analytics
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
          <Badge variant="default">
            <BarChart3 className="h-3 w-3 mr-1" />
            CoinGecko API
          </Badge>
        </div>
      </div>

      {/* Market Info Banner */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <BarChart3 className="h-5 w-5" />
            <span>Cryptocurrency Market Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-800">📊 Real-Time Data</h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Live prices from CoinGecko API</li>
                <li>• Updated every 5 minutes</li>
                <li>• Support for 10,000+ cryptocurrencies</li>
                <li>• Historical price data and charts</li>
                <li>• Market cap and volume tracking</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-800">💼 Portfolio Analytics</h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• Real-time portfolio valuation</li>
                <li>• Asset allocation breakdown</li>
                <li>• Performance tracking</li>
                <li>• Profit/loss calculations</li>
                <li>• Price change notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Getting Started</span>
          </CardTitle>
          <CardDescription>
            How to use market data for better trading decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">1. Track Prices</div>
              <p className="text-sm text-muted-foreground">
                Monitor real-time prices for your favorite cryptocurrencies. Set up alerts for significant price movements.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">2. Analyze Trends</div>
              <p className="text-sm text-muted-foreground">
                Use price charts and historical data to identify trends and make informed investment decisions.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">3. Manage Portfolio</div>
              <p className="text-sm text-muted-foreground">
                Track your portfolio performance, asset allocation, and overall profitability in real-time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Investment Disclaimer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-yellow-800">
            <p>• Cryptocurrency investments are subject to high market risk and volatility</p>
            <p>• Past performance does not guarantee future results</p>
            <p>• Always do your own research before investing</p>
            <p>• Never invest more than you can afford to lose</p>
            <p>• Market data is provided for informational purposes only</p>
          </div>
        </CardContent>
      </Card>

      {/* Market Data Component */}
      <MarketDataComponent
        walletBalances={walletBalances}
        onPriceAlert={handlePriceAlert}
      />

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Advanced Features</span>
          </CardTitle>
          <CardDescription>
            Additional market data capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">🔔 Price Alerts</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Set custom price thresholds</li>
                <li>• Receive notifications for price movements</li>
                <li>• Multiple alert conditions</li>
                <li>• Email and in-app notifications</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">📈 Technical Analysis</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Price chart patterns</li>
                <li>• Technical indicators</li>
                <li>• Support and resistance levels</li>
                <li>• Trading signals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}