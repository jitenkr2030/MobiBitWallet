"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Wallet, 
  Trash2, 
  Edit, 
  Copy, 
  ArrowRightLeft, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { WalletBalanceCard } from "./wallet-balance-card";

interface Wallet {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'savings';
  balance: number;
  currency: string;
  change24h: number;
  address: string;
  isActive: boolean;
  createdAt: string;
}

interface WalletManagementProps {
  wallets: Wallet[];
  onWalletCreate?: (wallet: Omit<Wallet, 'id' | 'createdAt'>) => void;
  onWalletUpdate?: (id: string, wallet: Partial<Wallet>) => void;
  onWalletDelete?: (id: string) => void;
  onWalletSelect?: (id: string) => void;
  selectedWalletId?: string;
}

export function WalletManagement({
  wallets,
  onWalletCreate,
  onWalletUpdate,
  onWalletDelete,
  onWalletSelect,
  selectedWalletId
}: WalletManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'personal' as 'personal' | 'business' | 'savings',
    currency: 'BTC'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [transferDialog, setTransferDialog] = useState<{
    isOpen: boolean;
    fromWallet?: string;
    toWallet?: string;
    amount: string;
  }>({ isOpen: false, amount: '' });

  const handleCreateWallet = () => {
    if (!newWallet.name.trim()) return;

    const walletData = {
      name: newWallet.name,
      type: newWallet.type,
      balance: 0,
      currency: newWallet.currency,
      change24h: 0,
      address: generateMockAddress(),
      isActive: true
    };

    onWalletCreate?.(walletData);
    setNewWallet({ name: '', type: 'personal', currency: 'BTC' });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateWallet = (wallet: Wallet) => {
    onWalletUpdate?.(wallet.id, {
      name: wallet.name,
      type: wallet.type,
      isActive: wallet.isActive
    });
    setEditingWallet(null);
  };

  const handleDeleteWallet = (id: string) => {
    onWalletDelete?.(id);
    setShowDeleteConfirm(null);
  };

  const handleTransfer = () => {
    if (!transferDialog.fromWallet || !transferDialog.toWallet || !transferDialog.amount) return;

    const amount = parseFloat(transferDialog.amount);
    if (isNaN(amount) || amount <= 0) return;

    // In a real app, this would make actual API calls
    console.log(`Transferring ${amount} from ${transferDialog.fromWallet} to ${transferDialog.toWallet}`);
    
    setTransferDialog({ isOpen: false, amount: '' });
  };

  const generateMockAddress = () => {
    return `bc1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
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

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const activeWallets = wallets.filter(w => w.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wallet Management</h2>
          <p className="text-muted-foreground">
            Manage your multiple wallets and transfers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
              <DialogDescription>
                Add a new wallet to your account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Wallet Name</Label>
                <Input
                  id="wallet-name"
                  placeholder="My Personal Wallet"
                  value={newWallet.name}
                  onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-type">Wallet Type</Label>
                <Select value={newWallet.type} onValueChange={(value: any) => setNewWallet({ ...newWallet, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet-currency">Currency</Label>
                <Select value={newWallet.currency} onValueChange={(value) => setNewWallet({ ...newWallet, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateWallet} className="flex-1">
                  Create Wallet
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Wallets</p>
                <p className="text-2xl font-bold">{wallets.length}</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Wallets</p>
                <p className="text-2xl font-bold">{activeWallets.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">{totalBalance.toFixed(8)} BTC</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Between Wallets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5" />
            <span>Transfer Between Wallets</span>
          </CardTitle>
          <CardDescription>
            Move funds between your wallets instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select 
              value={transferDialog.fromWallet} 
              onValueChange={(value) => setTransferDialog({ ...transferDialog, fromWallet: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="From wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name} ({wallet.balance.toFixed(8)} {wallet.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Select 
              value={transferDialog.toWallet} 
              onValueChange={(value) => setTransferDialog({ ...transferDialog, toWallet: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="To wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              placeholder="Amount"
              value={transferDialog.amount}
              onChange={(e) => setTransferDialog({ ...transferDialog, amount: e.target.value })}
              step="0.00000001"
            />
            
            <Button 
              onClick={handleTransfer}
              disabled={!transferDialog.fromWallet || !transferDialog.toWallet || !transferDialog.amount}
            >
              Transfer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{wallet.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getWalletTypeColor(wallet.type)}>
                    {wallet.type}
                  </Badge>
                  {!wallet.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              <CardDescription className="flex items-center">
                <Wallet className="h-4 w-4 mr-1" />
                {wallet.currency} Wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Balance */}
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {wallet.balance.toFixed(8)} {wallet.currency}
                </div>
                <div className="flex items-center text-sm">
                  {wallet.change24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                  )}
                  <span className={wallet.change24h >= 0 ? "text-green-600" : "text-red-600"}>
                    {wallet.change24h >= 0 ? "+" : ""}{wallet.change24h.toFixed(2)}% (24h)
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Address:</div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-muted-foreground font-mono flex-1">
                    {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(wallet.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onWalletSelect?.(wallet.id)}
                >
                  Select
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingWallet(wallet)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(wallet.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Wallet Dialog */}
      {editingWallet && (
        <Dialog open={!!editingWallet} onOpenChange={() => setEditingWallet(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Wallet</DialogTitle>
              <DialogDescription>
                Update wallet information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Wallet Name</Label>
                <Input
                  id="edit-name"
                  value={editingWallet.name}
                  onChange={(e) => setEditingWallet({ ...editingWallet, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Wallet Type</Label>
                <Select 
                  value={editingWallet.type} 
                  onValueChange={(value: any) => setEditingWallet({ ...editingWallet, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editingWallet.isActive}
                  onChange={(e) => setEditingWallet({ ...editingWallet, isActive: e.target.checked })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => handleUpdateWallet(editingWallet)} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingWallet(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Wallet</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this wallet? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                Deleting a wallet will permanently remove it and all associated data.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteWallet(showDeleteConfirm)}
                className="flex-1"
              >
                Delete Wallet
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}