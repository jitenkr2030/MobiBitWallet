"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TransactionList } from "@/components/wallet/transaction-list";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Calendar,
  DollarSign,
  Clock
} from "lucide-react";
import { Transaction } from "@/components/wallet";

interface TransactionWithDetails extends Transaction {
  walletName?: string;
  usdValue?: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [walletFilter, setWalletFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("timestamp");
  const [isLoading, setIsLoading] = useState(true);

  // Mock wallets for filtering
  const wallets = [
    { id: "1", name: "Personal Wallet" },
    { id: "2", name: "Business Wallet" },
    { id: "3", name: "Savings Wallet" }
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter, walletFilter, dateFilter, sortBy]);

  const loadTransactions = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockTransactions: TransactionWithDetails[] = [
        {
          id: "1",
          type: "received",
          amount: 0.00123456,
          fee: 0,
          currency: "BTC",
          fromAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
          toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          status: "confirmed",
          confirmations: 6,
          description: "Payment from client",
          timestamp: "2024-01-15T14:30:00Z",
          walletName: "Personal Wallet",
          usdValue: 53.42
        },
        {
          id: "2",
          type: "sent",
          amount: 0.00056789,
          fee: 0.00000123,
          currency: "BTC",
          fromAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          toAddress: "bc1q9k8m7x5l3v2n1p8r6t4y3u2i1o0p9w8e7d6c5",
          status: "confirmed",
          confirmations: 12,
          description: "Coffee purchase",
          timestamp: "2024-01-15T10:15:00Z",
          walletName: "Personal Wallet",
          usdValue: 24.56
        },
        {
          id: "3",
          type: "received",
          amount: 0.00345678,
          fee: 0,
          currency: "BTC",
          fromAddress: "bc1q7t3f4g5h6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x",
          toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          status: "pending",
          confirmations: 2,
          description: "Freelance payment",
          timestamp: "2024-01-14T16:45:00Z",
          walletName: "Business Wallet",
          usdValue: 149.67
        },
        {
          id: "4",
          type: "transfer",
          amount: 0.00234567,
          fee: 0.00000056,
          currency: "BTC",
          fromAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          toAddress: "bc1q9k8m7x5l3v2n1p8r6t4y3u2i1o0p9w8e7d6c5",
          status: "confirmed",
          confirmations: 8,
          description: "Transfer to savings",
          timestamp: "2024-01-14T09:20:00Z",
          walletName: "Personal Wallet",
          usdValue: 101.45
        },
        {
          id: "5",
          type: "sent",
          amount: 0.00111111,
          fee: 0.00000234,
          currency: "BTC",
          fromAddress: "bc1q9k8m7x5l3v2n1p8r6t4y3u2i1o0p9w8e7d6c5",
          toAddress: "bc1qz2y3x4w5v6u7t8s9r0q1p2o3i4u5y6t7r8e9w0",
          status: "failed",
          confirmations: 0,
          description: "Online purchase",
          timestamp: "2024-01-13T18:30:00Z",
          walletName: "Business Wallet",
          usdValue: 48.03
        },
        {
          id: "6",
          type: "received",
          amount: 0.00555555,
          fee: 0,
          currency: "BTC",
          fromAddress: "bc1qa2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
          toAddress: "bc1q9k8m7x5l3v2n1p8r6t4y3u2i1o0p9w8e7d6c5",
          status: "confirmed",
          confirmations: 15,
          description: "Investment return",
          timestamp: "2024-01-13T12:00:00Z",
          walletName: "Savings Wallet",
          usdValue: 240.12
        }
      ];

      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.walletName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Wallet filter
    if (walletFilter !== "all") {
      filtered = filtered.filter(tx => tx.walletName === wallets.find(w => w.id === walletFilter)?.name);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateFilter) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(tx => new Date(tx.timestamp) >= cutoffDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "amount_asc":
          return a.amount - b.amount;
        case "timestamp":
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    setFilteredTransactions(filtered);
  };

  const exportTransactions = () => {
    const csvContent = [
      // Headers
      ["Date", "Type", "Amount", "Currency", "Status", "Description", "Wallet", "USD Value"].join(","),
      // Data
      ...filteredTransactions.map(tx => [
        new Date(tx.timestamp).toLocaleDateString(),
        tx.type,
        tx.amount,
        tx.currency,
        tx.status,
        tx.description || "",
        tx.walletName || "",
        tx.usdValue || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "sent":
        return "bg-red-100 text-red-800";
      case "received":
        return "bg-green-100 text-green-800";
      case "transfer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalSent = filteredTransactions
    .filter(tx => tx.type === "sent")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalReceived = filteredTransactions
    .filter(tx => tx.type === "received")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalFees = filteredTransactions
    .reduce((sum, tx) => sum + tx.fee, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage all your wallet transactions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => loadTransactions()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{filteredTransactions.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{totalSent.toFixed(8)} BTC</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">{totalReceived.toFixed(8)} BTC</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">{totalFees.toFixed(8)} BTC</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={walletFilter} onValueChange={setWalletFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Wallet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wallets</SelectItem>
                {wallets.map(wallet => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setWalletFilter("all");
                  setDateFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Most Recent</SelectItem>
                <SelectItem value="amount">Highest Amount</SelectItem>
                <SelectItem value="amount_asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <TransactionList
        transactions={filteredTransactions}
        onTransactionClick={(transaction) => {
          console.log("Transaction clicked:", transaction);
          // In a real app, this would open a transaction detail modal
        }}
      />
    </div>
  );
}