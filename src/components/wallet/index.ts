export { WalletBalanceCard } from './wallet-balance-card';
export { TransactionList } from './transaction-list';
export { WalletManagement } from './wallet-management';

// Types
export interface Wallet {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'savings';
  balance: number;
  currency: string;
  change24h: number;
  address: string;
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'transfer';
  amount: number;
  fee: number;
  currency: string;
  fromAddress?: string;
  toAddress?: string;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  confirmations: number;
  description?: string;
  timestamp: string;
}