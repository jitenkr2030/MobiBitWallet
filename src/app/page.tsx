"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Shield, Zap, QrCode, Send, Download, Key, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

interface WalletBalance {
  id: string;
  name: string;
  type: "personal" | "business" | "savings";
  balance: number;
  currency: string;
  change24h: number;
}

interface Transaction {
  id: string;
  type: "sent" | "received";
  amount: number;
  currency: string;
  address: string;
  timestamp: string;
  status: "confirmed" | "pending" | "failed";
  description?: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/landing');
    } else if (!loading && user) {
      setAuthLoading(false);
      loadWalletData();
    }
  }, [loading, user, router]);

  const loadWalletData = () => {
    // Simulate API calls
    const loadData = async () => {
      // Mock wallet data
      const mockWallets: WalletBalance[] = [
        {
          id: "personal",
          name: "Personal Wallet",
          type: "personal",
          balance: 0.02345678,
          currency: "BTC",
          change24h: 2.5,
        },
        {
          id: "business",
          name: "Business Wallet",
          type: "business",
          balance: 0.15678901,
          currency: "BTC",
          change24h: -1.2,
        },
        {
          id: "savings",
          name: "Savings Wallet",
          type: "savings",
          balance: 0.89123456,
          currency: "BTC",
          change24h: 0.8,
        },
      ];

      // Mock transaction data
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          type: "received",
          amount: 0.00123456,
          currency: "BTC",
          address: "bc1qar0s...",
          timestamp: "2024-01-15T14:30:00Z",
          status: "confirmed",
          description: "Payment from client",
        },
        {
          id: "2",
          type: "sent",
          amount: 0.00056789,
          currency: "BTC",
          address: "bc1qxy2k...",
          timestamp: "2024-01-15T10:15:00Z",
          status: "confirmed",
          description: "Coffee purchase",
        },
        {
          id: "3",
          type: "received",
          amount: 0.00345678,
          currency: "BTC",
          address: "bc1q7t3f...",
          timestamp: "2024-01-14T16:45:00Z",
          status: "pending",
          description: "Freelance payment",
        },
        {
          id: "4",
          type: "sent",
          amount: 0.00234567,
          currency: "BTC",
          address: "bc1q9k8l...",
          timestamp: "2024-01-14T09:20:00Z",
          status: "confirmed",
        },
      ];

      setTimeout(() => {
        setWallets(mockWallets);
        setTransactions(mockTransactions);
      }, 1000);
    };

    loadData();
  };

  const [selectedWallet, setSelectedWallet] = useState<string>("personal");

  const formatBalance = (balance: number) => {
    return balance.toFixed(8);
  };

  const formatCurrency = (amount: number, currency: string) => {
    // Mock conversion rate (in a real app, this would come from an API)
    const btcToUsd = 43250;
    const usdAmount = amount * btcToUsd;
    return `${currency} ${formatBalance(amount)} (~$${usdAmount.toLocaleString()})`;
  };

  const getWalletTypeColor = (type: string) => {
    switch (type) {
      case "personal":
        return "bg-blue-100 text-blue-800";
      case "business":
        return "bg-green-100 text-green-800";
      case "savings":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedWalletData = wallets.find(w => w.id === selectedWallet);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MobBitWallet</h1>
          <p className="text-muted-foreground">Be Your Own Bank</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/settings">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/wallets">
              <Wallet className="h-4 w-4 mr-2" />
              Wallets
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/market">
              <BarChart3 className="h-4 w-4 mr-2" />
              Market
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/lightning">
              <Zap className="h-4 w-4 mr-2" />
              Lightning
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/recovery">
              <Key className="h-4 w-4 mr-2" />
              Recovery
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/qr-codes">
              <QrCode className="h-4 w-4 mr-2" />
              QR Codes
            </a>
          </Button>
          {user?.isMerchant && (
            <Button variant="outline" size="sm" asChild>
              <a href="/merchant-management">
                <Building className="h-4 w-4 mr-2" />
                Merchant
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <Card 
            key={wallet.id} 
            className={`cursor-pointer transition-all ${
              selectedWallet === wallet.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedWallet(wallet.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{wallet.name}</CardTitle>
                <Badge className={getWalletTypeColor(wallet.type)}>
                  {wallet.type}
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <Wallet className="h-4 w-4 mr-1" />
                {wallet.currency} Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatBalance(wallet.balance)} {wallet.currency}
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className={`h-4 w-4 mr-1 ${
                    wallet.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <span className={wallet.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {wallet.change24h >= 0 ? '+' : ''}{wallet.change24h}% (24h)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common wallet operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col" variant="outline">
              <Send className="h-6 w-6 mb-2" />
              Send
            </Button>
            <Button className="h-20 flex-col" variant="outline">
              <Download className="h-6 w-6 mb-2" />
              Receive
            </Button>
            <Button className="h-20 flex-col" variant="outline">
              <QrCode className="h-6 w-6 mb-2" />
              Scan QR
            </Button>
            <Button className="h-20 flex-col" variant="outline">
              <Zap className="h-6 w-6 mb-2" />
              Lightning
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            {selectedWalletData && `Showing transactions for ${selectedWalletData.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {transaction.type === 'sent' ? (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {transaction.type === 'sent' ? 'Sent' : 'Received'} {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.description || `To: ${transaction.address.slice(0, 10)}...`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </ProtectedRoute>
  );
}