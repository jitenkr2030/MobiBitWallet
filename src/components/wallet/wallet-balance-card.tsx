"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface WalletBalanceCardProps {
  name: string;
  type: "personal" | "business" | "savings";
  balance: number;
  currency: string;
  change24h: number;
  address: string;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function WalletBalanceCard({
  name,
  type,
  balance,
  currency,
  change24h,
  address,
  onSelect,
  isSelected = false,
}: WalletBalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [showAddress, setShowAddress] = useState(false);

  const formatBalance = (balance: number) => {
    return balance.toFixed(8);
  };

  const formatCurrency = (amount: number, currency: string) => {
    // Mock conversion rate (in a real app, this would come from an API)
    const btcToUsd = 43250;
    const usdAmount = amount * btcToUsd;
    return `(~$${usdAmount.toLocaleString()})`;
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge className={getWalletTypeColor(type)}>
            {type}
          </Badge>
        </div>
        <CardDescription className="flex items-center">
          <Wallet className="h-4 w-4 mr-1" />
          {currency} Wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {showBalance ? `${formatBalance(balance)} ${currency}` : "••••••••"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowBalance(!showBalance);
              }}
            >
              {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {showBalance && (
            <div className="text-sm text-muted-foreground">
              {formatCurrency(balance, currency)}
            </div>
          )}
        </div>

        {/* 24h Change */}
        <div className="flex items-center text-sm">
          {change24h >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
          )}
          <span className={change24h >= 0 ? "text-green-600" : "text-red-600"}>
            {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}% (24h)
          </span>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Address:</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddress(!showAddress);
              }}
            >
              {showAddress ? "Hide" : "Show"}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground font-mono">
              {showAddress ? address : truncatedAddress}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(address);
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            Send
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Receive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}