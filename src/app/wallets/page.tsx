"use client";

import { useState } from "react";
import { WalletManagement } from "@/components/wallet/wallet-management";
import { Wallet } from "@/components/wallet";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([
    {
      id: "1",
      name: "Personal Wallet",
      type: "personal",
      balance: 0.02345678,
      currency: "BTC",
      change24h: 2.5,
      address: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "2",
      name: "Business Wallet",
      type: "business",
      balance: 0.15678901,
      currency: "BTC",
      change24h: -1.2,
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      isActive: true,
      createdAt: "2024-01-15T00:00:00Z"
    },
    {
      id: "3",
      name: "Savings Wallet",
      type: "savings",
      balance: 0.89123456,
      currency: "BTC",
      change24h: 0.8,
      address: "bc1q9k8m7x5l3v2n1p8r6t4y3u2i1o0p9w8e7d6c5",
      isActive: true,
      createdAt: "2024-02-01T00:00:00Z"
    }
  ]);

  const [selectedWalletId, setSelectedWalletId] = useState<string>("1");

  const handleWalletCreate = (walletData: Omit<Wallet, 'id' | 'createdAt'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setWallets([...wallets, newWallet]);
  };

  const handleWalletUpdate = (id: string, updates: Partial<Wallet>) => {
    setWallets(wallets.map(wallet => 
      wallet.id === id ? { ...wallet, ...updates } : wallet
    ));
  };

  const handleWalletDelete = (id: string) => {
    setWallets(wallets.filter(wallet => wallet.id !== id));
    if (selectedWalletId === id) {
      setSelectedWalletId(wallets[0]?.id || "");
    }
  };

  const handleWalletSelect = (id: string) => {
    setSelectedWalletId(id);
  };

  return (
    <div className="container mx-auto p-6">
      <WalletManagement
        wallets={wallets}
        onWalletCreate={handleWalletCreate}
        onWalletUpdate={handleWalletUpdate}
        onWalletDelete={handleWalletDelete}
        onWalletSelect={handleWalletSelect}
        selectedWalletId={selectedWalletId}
      />
    </div>
  );
}