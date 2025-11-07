// QR Code Service for MobBitWallet
// This service handles QR code generation and scanning for payments

export interface QRCodeData {
  type: 'bitcoin' | 'lightning' | 'address' | 'url';
  data: string;
  label?: string;
  amount?: number;
  message?: string;
}

export interface ScanResult {
  data: string;
  type: 'bitcoin' | 'lightning' | 'address' | 'url' | 'text';
  isValid: boolean;
  parsedData?: any;
}

class QRCodeService {
  /**
   * Generate QR code data for Bitcoin payment
   */
  generateBitcoinQR(
    address: string,
    amount?: number,
    label?: string,
    message?: string
  ): QRCodeData {
    let qrString = `bitcoin:${address}`;
    
    const params: string[] = [];
    
    if (amount && amount > 0) {
      params.push(`amount=${amount}`);
    }
    
    if (label) {
      params.push(`label=${encodeURIComponent(label)}`);
    }
    
    if (message) {
      params.push(`message=${encodeURIComponent(message)}`);
    }
    
    if (params.length > 0) {
      qrString += `?${params.join('&')}`;
    }
    
    return {
      type: 'bitcoin',
      data: qrString,
      label,
      amount,
      message
    };
  }

  /**
   * Generate QR code data for Lightning payment
   */
  generateLightningQR(invoice: string, label?: string): QRCodeData {
    return {
      type: 'lightning',
      data: invoice,
      label
    };
  }

  /**
   * Generate QR code for wallet address
   */
  generateAddressQR(address: string, label?: string): QRCodeData {
    return {
      type: 'address',
      data: address,
      label
    };
  }

  /**
   * Generate QR code for URL
   */
  generateUrlQR(url: string, label?: string): QRCodeData {
    return {
      type: 'url',
      data: url,
      label
    };
  }

  /**
   * Parse scanned QR code data
   */
  parseQRCode(data: string): ScanResult {
    // Remove any whitespace
    const cleanData = data.trim();
    
    // Check if it's a Bitcoin URI
    if (cleanData.startsWith('bitcoin:')) {
      return this.parseBitcoinURI(cleanData);
    }
    
    // Check if it's a Lightning invoice
    if (cleanData.startsWith('lnbc') || cleanData.startsWith('lnurl')) {
      return {
        data: cleanData,
        type: 'lightning',
        isValid: this.isValidLightningInvoice(cleanData),
        parsedData: {
          invoice: cleanData,
          type: 'lightning'
        }
      };
    }
    
    // Check if it's a valid Bitcoin address
    if (this.isValidBitcoinAddress(cleanData)) {
      return {
        data: cleanData,
        type: 'address',
        isValid: true,
        parsedData: {
          address: cleanData,
          type: 'bitcoin'
        }
      };
    }
    
    // Check if it's a URL
    if (this.isValidUrl(cleanData)) {
      return {
        data: cleanData,
        type: 'url',
        isValid: true,
        parsedData: {
          url: cleanData,
          type: 'url'
        }
      };
    }
    
    // Treat as plain text
    return {
      data: cleanData,
      type: 'text',
      isValid: true
    };
  }

  /**
   * Parse Bitcoin URI
   */
  private parseBitcoinURI(uri: string): ScanResult {
    try {
      const url = new URL(uri);
      const address = url.pathname;
      
      if (!this.isValidBitcoinAddress(address)) {
        return {
          data: uri,
          type: 'bitcoin',
          isValid: false
        };
      }
      
      const params = new URLSearchParams(url.search);
      const amount = params.get('amount');
      const label = params.get('label');
      const message = params.get('message');
      
      return {
        data: uri,
        type: 'bitcoin',
        isValid: true,
        parsedData: {
          address,
          amount: amount ? parseFloat(amount) : undefined,
          label: label ? decodeURIComponent(label) : undefined,
          message: message ? decodeURIComponent(message) : undefined,
          type: 'bitcoin'
        }
      };
    } catch (error) {
      return {
        data: uri,
        type: 'bitcoin',
        isValid: false
      };
    }
  }

  /**
   * Validate Bitcoin address (simplified validation)
   */
  private isValidBitcoinAddress(address: string): boolean {
    // Basic validation - in production, use a proper Bitcoin address validation library
    const bitcoinAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return bitcoinAddressRegex.test(address);
  }

  /**
   * Validate Lightning invoice (simplified validation)
   */
  private isValidLightningInvoice(invoice: string): boolean {
    // Basic validation - in production, use proper Lightning invoice decoding
    return invoice.startsWith('lnbc') && invoice.length > 100;
  }

  /**
   * Validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate QR code as data URL (for display)
   */
  async generateQRCodeDataURL(
    data: string,
    size: number = 256,
    backgroundColor: string = '#ffffff',
    foregroundColor: string = '#000000'
  ): Promise<string> {
    // In a real implementation, you would use a QR code library like qrcode
    // For now, we'll return a placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
        <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle" 
              font-family="monospace" font-size="12" fill="${foregroundColor}">
          QR Code: ${data.substring(0, 20)}...
        </text>
      </svg>
    `)}`;
  }

  /**
   * Simulate QR code scanning
   */
  async simulateQRScan(): Promise<ScanResult> {
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock scan results for testing
    const mockResults = [
      'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.001&label=Test',
      'lnbc1000n1p3khl2p...',
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      'https://mobbitwallet.com'
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    return this.parseQRCode(randomResult);
  }

  /**
   * Create payment request QR code
   */
  createPaymentQR(
    type: 'bitcoin' | 'lightning',
    addressOrInvoice: string,
    amount?: number,
    label?: string,
    message?: string
  ): QRCodeData {
    if (type === 'bitcoin') {
      return this.generateBitcoinQR(addressOrInvoice, amount, label, message);
    } else {
      return this.generateLightningQR(addressOrInvoice, label);
    }
  }

  /**
   * Get QR code suggestions based on context
   */
  getQRSuggestions(context: 'receive' | 'send' | 'merchant'): QRCodeData[] {
    const suggestions: QRCodeData[] = [];
    
    if (context === 'receive') {
      suggestions.push(
        this.generateBitcoinQR('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 0.001, 'MobBitWallet Receive'),
        this.generateLightningQR('lnbc1000n1p3khl2p...', 'Lightning Payment')
      );
    } else if (context === 'send') {
      suggestions.push(
        this.generateBitcoinQR('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 0.0005, 'Payment'),
        this.generateUrlQR('https://mobbitwallet.com/pay', 'Payment Link')
      );
    } else if (context === 'merchant') {
      suggestions.push(
        this.generateBitcoinQR('bc1q9k8m7x5l3v2n1p8r6t4y3u2i1o0p9w8e7d6c5', 0.01, 'Merchant Payment'),
        this.generateLightningQR('lnbc2500n1p3khl2p...', 'Merchant Invoice')
      );
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const qrCodeService = new QRCodeService();