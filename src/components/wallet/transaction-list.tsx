"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: string;
  type: "sent" | "received" | "transfer";
  amount: number;
  fee: number;
  currency: string;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  confirmations: number;
  description?: string;
  timestamp: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onTransactionClick }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("timestamp");

  const formatBalance = (balance: number) => {
    return balance.toFixed(8);
  };

  const formatCurrency = (amount: number, currency: string) => {
    // Mock conversion rate (in a real app, this would come from an API)
    const btcToUsd = 43250;
    const usdAmount = amount * btcToUsd;
    return `${currency} ${formatBalance(amount)} (~$${usdAmount.toLocaleString()})`;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesSearch = 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
      const matchesType = typeFilter === "all" || tx.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount":
          return b.amount - a.amount;
        case "timestamp":
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  const truncatedAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          All your wallet transactions in one place
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
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
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Recent</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transaction List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onTransactionClick?.(transaction)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'sent' ? 'bg-red-100' : 
                    transaction.type === 'received' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {transaction.type === 'sent' ? (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    ) : transaction.type === 'received' ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {transaction.type === 'sent' && 'Sent'}
                      {transaction.type === 'received' && 'Received'}
                      {transaction.type === 'transfer' && 'Transfer'}{' '}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.description || (
                        <>
                          {transaction.type === 'sent' && `To: ${truncatedAddress(transaction.toAddress || '')}`}
                          {transaction.type === 'received' && `From: ${truncatedAddress(transaction.fromAddress || '')}`}
                          {transaction.type === 'transfer' && `Transfer between wallets`}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleString()}
                      {transaction.fee > 0 && ` • Fee: ${formatBalance(transaction.fee)} ${transaction.currency}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(transaction.status)}
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                  {transaction.status === "pending" && (
                    <div className="text-xs text-muted-foreground">
                      {transaction.confirmations}/6 confirmations
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredTransactions.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="sm">
              Load More Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}