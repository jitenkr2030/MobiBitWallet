// Lightning Network Service for MobBitWallet
// This service handles Lightning Network operations and integrations

export interface LightningInvoice {
  payment_request: string;
  r_hash: string;
  description: string;
  amount_msat: number;
  timestamp: number;
  expiry: number;
  payee: string;
}

export interface LightningPayment {
  payment_hash: string;
  payment_preimage: string;
  amount_msat: number;
  fee_msat: number;
  status: 'pending' | 'complete' | 'failed';
  created_at: number;
  completed_at?: number;
}

export interface LightningNodeInfo {
  pubkey: string;
  alias: string;
  color: string;
  addresses: Array<{
    type: string;
    address: string;
    port: number;
  }>;
  capacity_sat: number;
  active_channels: number;
}

export interface LightningChannel {
  id: string;
  peer_id: string;
  capacity_sat: number;
  local_balance_sat: number;
  remote_balance_sat: number;
  state: 'active' | 'inactive' | 'pending' | 'closing';
  private: boolean;
}

class LightningService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // In production, these would come from environment variables
    this.baseUrl = process.env.LIGHTNING_NODE_URL || 'http://localhost:8080';
    this.apiKey = process.env.LIGHTNING_API_KEY || 'default-api-key';
  }

  /**
   * Create a Lightning invoice for receiving payments
   */
  async createInvoice(
    amount: number, // in BTC
    description: string = '',
    expiry: number = 3600 // 1 hour default
  ): Promise<LightningInvoice> {
    try {
      const amountMsat = Math.floor(amount * 100_000_000); // Convert BTC to satoshis, then to msat
      
      // Mock implementation - in production, this would call actual Lightning node API
      const mockInvoice: LightningInvoice = {
        payment_request: `lnbc${amountMsat}n1p3khl2p${this.generateRandomString(80)}`,
        r_hash: this.generateRandomHash(),
        description,
        amount_msat: amountMsat,
        timestamp: Math.floor(Date.now() / 1000),
        expiry,
        payee: 'mock-pubkey'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockInvoice;
    } catch (error) {
      console.error('Error creating Lightning invoice:', error);
      throw new Error('Failed to create Lightning invoice');
    }
  }

  /**
   * Pay a Lightning invoice
   */
  async payInvoice(invoice: string): Promise<LightningPayment> {
    try {
      // Mock implementation - in production, this would call actual Lightning node API
      const mockPayment: LightningPayment = {
        payment_hash: this.generateRandomHash(),
        payment_preimage: this.generateRandomHash(),
        amount_msat: Math.floor(Math.random() * 100_000_000),
        fee_msat: Math.floor(Math.random() * 1000),
        status: 'complete',
        created_at: Math.floor(Date.now() / 1000),
        completed_at: Math.floor(Date.now() / 1000)
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockPayment;
    } catch (error) {
      console.error('Error paying Lightning invoice:', error);
      throw new Error('Failed to pay Lightning invoice');
    }
  }

  /**
   * Decode a Lightning invoice to get its details
   */
  async decodeInvoice(invoice: string): Promise<Partial<LightningInvoice>> {
    try {
      // Mock implementation - in production, this would decode the actual invoice
      const mockDecoded: Partial<LightningInvoice> = {
        description: 'Mock payment description',
        amount_msat: 100_000, // 1000 sats
        timestamp: Math.floor(Date.now() / 1000),
        expiry: 3600,
        payee: 'mock-pubkey'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return mockDecoded;
    } catch (error) {
      console.error('Error decoding Lightning invoice:', error);
      throw new Error('Failed to decode Lightning invoice');
    }
  }

  /**
   * Get Lightning node information
   */
  async getNodeInfo(): Promise<LightningNodeInfo> {
    try {
      // Mock implementation
      const mockNodeInfo: LightningNodeInfo = {
        pubkey: '03abc123...def456',
        alias: 'MobBitWallet-Node',
        color: '#03a9f4',
        addresses: [
          { type: 'ipv4', address: '127.0.0.1', port: 9735 },
          { type: 'tor', address: 'abcdef12345.onion', port: 9735 }
        ],
        capacity_sat: 1_000_000, // 1 BTC
        active_channels: 3
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockNodeInfo;
    } catch (error) {
      console.error('Error getting node info:', error);
      throw new Error('Failed to get Lightning node info');
    }
  }

  /**
   * Get list of Lightning channels
   */
  async getChannels(): Promise<LightningChannel[]> {
    try {
      // Mock implementation
      const mockChannels: LightningChannel[] = [
        {
          id: 'channel1',
          peer_id: 'peer123',
          capacity_sat: 500_000,
          local_balance_sat: 250_000,
          remote_balance_sat: 250_000,
          state: 'active',
          private: false
        },
        {
          id: 'channel2',
          peer_id: 'peer456',
          capacity_sat: 300_000,
          local_balance_sat: 100_000,
          remote_balance_sat: 200_000,
          state: 'active',
          private: true
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return mockChannels;
    } catch (error) {
      console.error('Error getting channels:', error);
      throw new Error('Failed to get Lightning channels');
    }
  }

  /**
   * Open a new Lightning channel
   */
  async openChannel(
    peerPubkey: string,
    amount: number, // in BTC
    isPrivate: boolean = false
  ): Promise<LightningChannel> {
    try {
      const amountSat = Math.floor(amount * 100_000_000); // Convert BTC to satoshis
      
      // Mock implementation
      const mockChannel: LightningChannel = {
        id: `channel_${Date.now()}`,
        peer_id: peerPubkey,
        capacity_sat: amountSat,
        local_balance_sat: amountSat,
        remote_balance_sat: 0,
        state: 'pending',
        private: isPrivate
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return mockChannel;
    } catch (error) {
      console.error('Error opening channel:', error);
      throw new Error('Failed to open Lightning channel');
    }
  }

  /**
   * Close a Lightning channel
   */
  async closeChannel(channelId: string): Promise<boolean> {
    try {
      // Mock implementation
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return true;
    } catch (error) {
      console.error('Error closing channel:', error);
      throw new Error('Failed to close Lightning channel');
    }
  }

  /**
   * Get Lightning network fees
   */
  async getFees(): Promise<{
    base_fee_msat: number;
    fee_rate: number;
    min_htlc_msat: number;
  }> {
    try {
      // Mock implementation
      const fees = {
        base_fee_msat: 1000,
        fee_rate: 0.001, // 0.1%
        min_htlc_msat: 1000
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return fees;
    } catch (error) {
      console.error('Error getting fees:', error);
      throw new Error('Failed to get Lightning fees');
    }
  }

  /**
   * Check if a Lightning invoice is paid
   */
  async checkInvoiceStatus(paymentHash: string): Promise<'pending' | 'paid' | 'expired'> {
    try {
      // Mock implementation - randomly return status for demo
      const statuses: Array<'pending' | 'paid' | 'expired'> = ['pending', 'paid', 'expired'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return randomStatus;
    } catch (error) {
      console.error('Error checking invoice status:', error);
      throw new Error('Failed to check invoice status');
    }
  }

  /**
   * Generate a random hash for mock data
   */
  private generateRandomHash(): string {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Generate a random string for mock data
   */
  private generateRandomString(length: number): string {
    const chars = '0289pyakcgrswjxvzq34567abcdef';
    return Array.from({ length }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  /**
   * Convert millisatoshis to BTC
   */
  msatsToBtc(msats: number): number {
    return msats / 100_000_000_000;
  }

  /**
   * Convert BTC to millisatoshis
   */
  btcToMsats(btc: number): number {
    return Math.floor(btc * 100_000_000_000);
  }

  /**
   * Convert satoshis to BTC
   */
  satsToBtc(sats: number): number {
    return sats / 100_000_000;
  }

  /**
   * Convert BTC to satoshis
   */
  btcToSats(btc: number): number {
    return Math.floor(btc * 100_000_000);
  }

  /**
   * Convert satoshis to millisatoshis
   */
  satsToMsats(sats: number): number {
    return sats * 1000;
  }

  /**
   * Convert millisatoshis to satoshis
   */
  msatsToSats(msats: number): number {
    return Math.floor(msats / 1000);
  }
}

// Export singleton instance
export const lightningService = new LightningService();