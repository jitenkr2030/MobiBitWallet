// Receipt Generation and Customer Notification Service for MobBitWallet
// This service handles receipt generation and customer notifications

export interface ReceiptData {
  id: string;
  paymentId: string;
  transactionId?: string;
  merchantName: string;
  merchantAddress?: string;
  merchantEmail?: string;
  merchantPhone?: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: 'bitcoin' | 'lightning' | 'other';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
  items?: ReceiptItem[];
  tax?: number;
  subtotal?: number;
  total?: number;
  confirmationNumber?: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
  category?: string;
}

export interface NotificationConfig {
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'payment_received' | 'payment_failed' | 'payment_refunded' | 'receipt_generated';
  subject: string;
  message: string;
  variables: string[];
}

export interface CustomerNotification {
  id: string;
  customerId: string;
  type: 'email' | 'sms' | 'push';
  templateId: string;
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  timestamp: string;
  data: any;
}

class ReceiptService {
  private receiptTemplates: Map<string, string> = new Map();
  private notificationTemplates: Map<string, NotificationTemplate> = new Map();
  private notificationQueue: CustomerNotification[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize receipt and notification templates
   */
  private initializeTemplates() {
    // Receipt templates
    this.receiptTemplates.set('default', this.getDefaultReceiptTemplate());
    this.receiptTemplates.set('minimal', this.getMinimalReceiptTemplate());
    this.receiptTemplates.set('detailed', this.getDetailedReceiptTemplate());

    // Notification templates
    this.notificationTemplates.set('payment_received', {
      id: 'payment_received',
      name: 'Payment Received',
      type: 'payment_received',
      subject: 'Payment Received - {{merchantName}}',
      message: 'Dear {{customerName}},\n\nThank you for your payment of {{amount}} {{currency}} for {{description}}.\n\nPayment Details:\n- Amount: {{amount}} {{currency}}\n- Payment Method: {{paymentMethod}}\n- Transaction ID: {{transactionId}}\n- Date: {{timestamp}}\n\nYou can download your receipt here: {{receiptUrl}}\n\nBest regards,\n{{merchantName}}',
      variables: ['customerName', 'amount', 'currency', 'description', 'paymentMethod', 'transactionId', 'timestamp', 'receiptUrl', 'merchantName']
    });

    this.notificationTemplates.set('payment_failed', {
      id: 'payment_failed',
      name: 'Payment Failed',
      type: 'payment_failed',
      subject: 'Payment Failed - {{merchantName}}',
      message: 'Dear {{customerName}},\n\nWe were unable to process your payment of {{amount}} {{currency}} for {{description}}.\n\nPlease try again or contact us if you continue to experience issues.\n\nError: {{errorMessage}}\n\nBest regards,\n{{merchantName}}',
      variables: ['customerName', 'amount', 'currency', 'description', 'errorMessage', 'merchantName']
    });

    this.notificationTemplates.set('receipt_generated', {
      id: 'receipt_generated',
      name: 'Receipt Generated',
      type: 'receipt_generated',
      subject: 'Your Receipt from {{merchantName}}',
      message: 'Dear {{customerName}},\n\nYour receipt for payment of {{amount}} {{currency}} is now available.\n\nReceipt Details:\n- Receipt ID: {{receiptId}}\n- Amount: {{amount}} {{currency}}\n- Date: {{timestamp}}\n- Description: {{description}}\n\nDownload your receipt: {{receiptUrl}}\n\nBest regards,\n{{merchantName}}',
      variables: ['customerName', 'receiptId', 'amount', 'currency', 'timestamp', 'description', 'receiptUrl', 'merchantName']
    });
  }

  /**
   * Generate receipt data
   */
  generateReceipt(paymentData: any): ReceiptData {
    const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const confirmationNumber = `CONF-${Date.now().toString().slice(-8)}`;

    const subtotal = paymentData.amount;
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const receipt: ReceiptData = {
      id: receiptId,
      paymentId: paymentData.id,
      transactionId: paymentData.transactionHash,
      merchantName: paymentData.merchantName || 'MobBitWallet Merchant',
      merchantAddress: paymentData.merchantAddress,
      merchantEmail: paymentData.merchantEmail,
      merchantPhone: paymentData.merchantPhone,
      customerName: paymentData.customerName || 'Valued Customer',
      customerEmail: paymentData.customerEmail,
      amount: total,
      currency: paymentData.currency || 'USD',
      description: paymentData.description,
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.status,
      timestamp: new Date().toISOString(),
      tax,
      subtotal,
      total,
      confirmationNumber
    };

    // Add items if provided
    if (paymentData.items) {
      receipt.items = paymentData.items.map((item: any, index: number) => ({
        id: `item_${index}`,
        name: item.name,
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.price,
        totalPrice: (item.unitPrice || item.price) * (item.quantity || 1),
        sku: item.sku,
        category: item.category
      }));
    } else {
      // Create default item
      receipt.items = [{
        id: 'item_1',
        name: paymentData.description,
        quantity: 1,
        unitPrice: subtotal,
        totalPrice: subtotal
      }];
    }

    return receipt;
  }

  /**
   * Generate receipt HTML
   */
  generateReceiptHTML(receipt: ReceiptData, template: string = 'default'): string {
    const templateContent = this.receiptTemplates.get(template) || this.receiptTemplates.get('default')!;
    
    let html = templateContent;

    // Replace template variables
    const variables = {
      receiptId: receipt.id,
      confirmationNumber: receipt.confirmationNumber || '',
      merchantName: receipt.merchantName,
      merchantAddress: receipt.merchantAddress || '',
      merchantEmail: receipt.merchantEmail || '',
      merchantPhone: receipt.merchantPhone || '',
      customerName: receipt.customerName,
      customerEmail: receipt.customerEmail,
      amount: receipt.amount.toFixed(2),
      currency: receipt.currency,
      description: receipt.description,
      paymentMethod: receipt.paymentMethod,
      status: receipt.status,
      timestamp: new Date(receipt.timestamp).toLocaleString(),
      tax: receipt.tax ? receipt.tax.toFixed(2) : '0.00',
      subtotal: receipt.subtotal ? receipt.subtotal.toFixed(2) : '0.00',
      total: receipt.total ? receipt.total.toFixed(2) : '0.00',
      transactionId: receipt.transactionId || '',
      items: receipt.items ? this.generateItemsHTML(receipt.items) : ''
    };

    // Replace all variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value.toString());
    });

    return html;
  }

  /**
   * Generate items HTML for receipt
   */
  private generateItemsHTML(items: ReceiptItem[]): string {
    return items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.unitPrice.toFixed(2)}</td>
        <td>$${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');
  }

  /**
   * Generate receipt PDF (simulated)
   */
  async generateReceiptPDF(receipt: ReceiptData): Promise<string> {
    // In a real implementation, this would use a PDF library like jsPDF or puppeteer
    // For demo purposes, we'll return a base64 encoded "PDF"
    const html = this.generateReceiptHTML(receipt);
    
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock base64 PDF (in real implementation, this would be actual PDF data)
    return `data:application/pdf;base64,${btoa(`PDF Receipt for ${receipt.customerName}`)}`;
  }

  /**
   * Send customer notification
   */
  async sendNotification(
    type: 'payment_received' | 'payment_failed' | 'payment_refunded' | 'receipt_generated',
    customerData: any,
    paymentData: any,
    config: NotificationConfig
  ): Promise<CustomerNotification> {
    const template = this.notificationTemplates.get(type);
    if (!template) {
      throw new Error(`Template not found: ${type}`);
    }

    // Prepare template variables
    const variables = {
      customerName: customerData.name || 'Valued Customer',
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      description: paymentData.description,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionHash || paymentData.id,
      timestamp: new Date().toISOString(),
      receiptUrl: `${window.location.origin}/receipt/${paymentData.id}`,
      merchantName: paymentData.merchantName || 'MobBitWallet Merchant',
      errorMessage: paymentData.errorMessage || 'Unknown error',
      receiptId: paymentData.receiptId || ''
    };

    // Replace template variables
    let subject = template.subject;
    let message = template.message;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value.toString());
      message = message.replace(regex, value.toString());
    });

    const notification: CustomerNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId: customerData.id,
      type: 'email',
      templateId: template.id,
      recipient: customerData.email,
      subject,
      message,
      status: 'pending',
      timestamp: new Date().toISOString(),
      data: { type, customerData, paymentData }
    };

    // Add to notification queue
    this.notificationQueue.push(notification);

    // Process notification (simulate sending)
    await this.processNotification(notification);

    return notification;
  }

  /**
   * Process notification (simulate sending)
   */
  private async processNotification(notification: CustomerNotification): Promise<void> {
    // Simulate notification processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful delivery
    notification.status = 'sent';
    
    // In a real implementation, this would:
    // - Send email via SMTP
    // - Send SMS via Twilio or similar service
    // - Send push notification via Firebase Cloud Messaging
    // - Call webhook if configured
    
    console.log(`Notification sent to ${notification.recipient}: ${notification.subject}`);
  }

  /**
   * Get default receipt template
   */
  private getDefaultReceiptTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .receipt { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .merchant-info { text-align: center; margin-bottom: 20px; }
        .receipt-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        .items-table th { background-color: #f8f9fa; }
        .totals { text-align: right; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>Payment Receipt</h1>
            <p>Confirmation #: {{confirmationNumber}}</p>
        </div>
        
        <div class="merchant-info">
            <h2>{{merchantName}}</h2>
            <p>{{merchantAddress}}</p>
            <p>{{merchantEmail}} | {{merchantPhone}}</p>
        </div>
        
        <div class="receipt-info">
            <div>
                <strong>Date:</strong> {{timestamp}}<br>
                <strong>Receipt ID:</strong> {{receiptId}}
            </div>
            <div>
                <strong>Customer:</strong> {{customerName}}<br>
                <strong>Email:</strong> {{customerEmail}}
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                {{items}}
            </tbody>
        </table>
        
        <div class="totals">
            <p><strong>Subtotal:</strong> ${{subtotal}}</p>
            <p><strong>Tax:</strong> ${{tax}}</p>
            <p><strong>Total:</strong> ${{total}}</p>
        </div>
        
        <div class="receipt-info">
            <div>
                <strong>Payment Method:</strong> {{paymentMethod}}<br>
                <strong>Status:</strong> {{status}}
            </div>
            <div>
                <strong>Transaction ID:</strong> {{transactionId}}<br>
                <strong>Description:</strong> {{description}}
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated receipt. No signature is required.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Get minimal receipt template
   */
  private getMinimalReceiptTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .receipt { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border: 1px solid #ddd; }
        .header { text-align: center; margin-bottom: 20px; }
        .details { margin-bottom: 15px; }
        .total { font-size: 18px; font-weight: bold; text-align: right; }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h2>{{merchantName}}</h2>
            <p>Receipt #{{receiptId}}</p>
        </div>
        <div class="details">
            <p><strong>Date:</strong> {{timestamp}}</p>
            <p><strong>Customer:</strong> {{customerName}}</p>
            <p><strong>Description:</strong> {{description}}</p>
            <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
        </div>
        <div class="total">
            Total: {{currency}} {{amount}}
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Get detailed receipt template
   */
  private getDetailedReceiptTemplate(): string {
    return this.getDefaultReceiptTemplate(); // For demo, same as default
  }

  /**
   * Get notification queue status
   */
  getNotificationQueueStatus(): {
    pending: number;
    sent: number;
    failed: number;
    total: number;
  } {
    const pending = this.notificationQueue.filter(n => n.status === 'pending').length;
    const sent = this.notificationQueue.filter(n => n.status === 'sent').length;
    const failed = this.notificationQueue.filter(n => n.status === 'failed').length;
    
    return {
      pending,
      sent,
      failed,
      total: this.notificationQueue.length
    };
  }

  /**
   * Get receipt by ID
   */
  getReceiptById(receiptId: string): ReceiptData | null {
    // In a real implementation, this would query a database
    // For demo purposes, we'll return null
    return null;
  }

  /**
   * Get customer notifications
   */
  getCustomerNotifications(customerId: string): CustomerNotification[] {
    return this.notificationQueue.filter(n => n.customerId === customerId);
  }
}

// Export singleton instance
export const receiptService = new ReceiptService();