"use client";

import { useState } from "react";
import { LightningComponent } from "@/components/lightning/lightning-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle, ArrowLeft, TrendingUp, AlertTriangle } from "lucide-react";

export default function LightningPage() {
  const [walletBalance] = useState(0.02345678); // Mock balance

  const handleTransactionComplete = (transaction: any) => {
    console.log('Lightning transaction completed:', transaction);
    // In a real app, this would update the transaction history and wallet balance
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
            <h1 className="text-3xl font-bold">Lightning Network</h1>
            <p className="text-muted-foreground">
              Instant Bitcoin payments with Lightning Network
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Node Online
          </Badge>
          <Badge variant="default">
            <Zap className="h-3 w-3 mr-1" />
            Lightning Ready
          </Badge>
        </div>
      </div>

      {/* Lightning Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Zap className="h-5 w-5" />
            <span>What is Lightning Network?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800">⚡ Lightning Benefits</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Instant transactions (under 1 second)</li>
                <li>• Extremely low fees (fractions of a cent)</li>
                <li>• High scalability (millions of transactions)</li>
                <li>• Better privacy for users</li>
                <li>• Micropayments enabled</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800">🔧 How it Works</h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Payment channels are opened between users</li>
                <li>• Transactions happen off-chain instantly</li>
                <li>• Channel balances are updated locally</li>
                <li>• Channels can be closed to settle on-chain</li>
                <li>• No need to wait for block confirmations</li>
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
            Quick start guide for using Lightning Network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">1. Open Channels</div>
              <p className="text-sm text-muted-foreground">
                Connect to other Lightning nodes by opening payment channels. This requires some Bitcoin to fund the channel.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">2. Receive Payments</div>
              <p className="text-sm text-muted-foreground">
                Create Lightning invoices to receive instant payments from anyone in the Lightning Network.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">3. Send Payments</div>
              <p className="text-sm text-muted-foreground">
                Pay Lightning invoices instantly with minimal fees, no waiting for confirmations.
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
            <span>Important Security Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-yellow-800">
            <p>• Lightning channels require locking up Bitcoin as collateral</p>
            <p>• Channel funds are not accessible until the channel is closed</p>
            <p>• Always keep backup of your channel data</p>
            <p>• Use reputable nodes and monitor channel health</p>
            <p>• Consider the risks before opening large channels</p>
          </div>
        </CardContent>
      </Card>

      {/* Lightning Component */}
      <LightningComponent
        walletBalance={walletBalance}
        onTransactionComplete={handleTransactionComplete}
      />
    </div>
  );
}