// Recurring Payment Service for MobBitWallet
// This service handles subscription management and recurring payment processing

export interface RecurringPayment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number; // Number of days between payments
  startDate: string;
  endDate?: string;
  nextPaymentDate: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'failed';
  paymentMethod: 'bitcoin' | 'lightning';
  maxPayments?: number;
  currentPayments: number;
  totalCollected: number;
  lastPaymentDate?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  maxPayments?: number;
  trialPeriod?: number; // days
  features: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RecurringPaymentHistory {
  id: string;
  recurringPaymentId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  paymentDate: string;
  errorMessage?: string;
  createdAt: string;
}

export interface RecurringPaymentAnalytics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  averageSubscriptionValue: number;
  paymentSuccessRate: number;
  upcomingPayments: number;
  failedPayments: number;
}

class RecurringPaymentService {
  private subscriptions: Map<string, RecurringPayment> = new Map();
  private plans: Map<string, SubscriptionPlan> = new Map();
  private paymentHistory: Map<string, RecurringPaymentHistory[]> = new Map();
  private paymentTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultPlans();
    this.startPaymentScheduler();
  }

  /**
   * Initialize default subscription plans
   */
  private initializeDefaultPlans() {
    const defaultPlans: SubscriptionPlan[] = [
      {
        id: 'basic_monthly',
        name: 'Basic Monthly',
        description: 'Perfect for individuals getting started',
        amount: 9.99,
        currency: 'USD',
        frequency: 'monthly',
        interval: 30,
        features: ['Basic features', 'Email support', 'Mobile app access'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        description: 'Advanced features for power users',
        amount: 19.99,
        currency: 'USD',
        frequency: 'monthly',
        interval: 30,
        features: ['All basic features', 'Priority support', 'Advanced analytics', 'API access'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'business_monthly',
        name: 'Business Monthly',
        description: 'Complete solution for businesses',
        amount: 49.99,
        currency: 'USD',
        frequency: 'monthly',
        interval: 30,
        features: ['All premium features', 'Team management', 'Custom integrations', 'Dedicated support'],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'basic_yearly',
        name: 'Basic Yearly',
        description: 'Basic plan with annual discount',
        amount: 99.99,
        currency: 'USD',
        frequency: 'yearly',
        interval: 365,
        features: ['All basic features', 'Email support', 'Mobile app access', '2 months free'],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    defaultPlans.forEach(plan => {
      this.plans.set(plan.id, plan);
    });
  }

  /**
   * Create a new recurring payment
   */
  async createRecurringPayment(paymentData: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    currency: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    startDate?: string;
    endDate?: string;
    paymentMethod: 'bitcoin' | 'lightning';
    maxPayments?: number;
    metadata?: any;
  }): Promise<RecurringPayment> {
    const id = `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const interval = this.getIntervalFromFrequency(paymentData.frequency);
    const startDate = paymentData.startDate || new Date().toISOString();
    const nextPaymentDate = this.calculateNextPaymentDate(startDate, interval);

    const recurringPayment: RecurringPayment = {
      id,
      customerId: paymentData.customerId,
      customerName: paymentData.customerName,
      customerEmail: paymentData.customerEmail,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      frequency: paymentData.frequency,
      interval,
      startDate,
      endDate: paymentData.endDate,
      nextPaymentDate,
      status: 'active',
      paymentMethod: paymentData.paymentMethod,
      maxPayments: paymentData.maxPayments,
      currentPayments: 0,
      totalCollected: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: paymentData.metadata
    };

    this.subscriptions.set(id, recurringPayment);
    this.paymentHistory.set(id, []);

    // Schedule the first payment
    this.schedulePayment(id);

    return recurringPayment;
  }

  /**
   * Create subscription from plan
   */
  async createSubscriptionFromPlan(
    planId: string,
    customerData: {
      customerId: string;
      customerName: string;
      customerEmail: string;
      paymentMethod: 'bitcoin' | 'lightning';
    }
  ): Promise<RecurringPayment> {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    return this.createRecurringPayment({
      customerId: customerData.customerId,
      customerName: customerData.customerName,
      customerEmail: customerData.customerEmail,
      amount: plan.amount,
      currency: plan.currency,
      description: plan.name,
      frequency: plan.frequency,
      paymentMethod: customerData.paymentMethod,
      maxPayments: plan.maxPayments,
      metadata: { planId, trialPeriod: plan.trialPeriod }
    });
  }

  /**
   * Pause a recurring payment
   */
  pauseRecurringPayment(id: string): boolean {
    const payment = this.subscriptions.get(id);
    if (!payment || payment.status !== 'active') {
      return false;
    }

    payment.status = 'paused';
    payment.updatedAt = new Date().toISOString();

    // Cancel scheduled payment
    this.cancelScheduledPayment(id);

    return true;
  }

  /**
   * Resume a paused recurring payment
   */
  resumeRecurringPayment(id: string): boolean {
    const payment = this.subscriptions.get(id);
    if (!payment || payment.status !== 'paused') {
      return false;
    }

    payment.status = 'active';
    payment.updatedAt = new Date().toISOString();

    // Reschedule next payment
    this.schedulePayment(id);

    return true;
  }

  /**
   * Cancel a recurring payment
   */
  cancelRecurringPayment(id: string, reason?: string): boolean {
    const payment = this.subscriptions.get(id);
    if (!payment || payment.status === 'cancelled' || payment.status === 'expired') {
      return false;
    }

    payment.status = 'cancelled';
    payment.updatedAt = new Date().toISOString();
    if (reason) {
      payment.metadata = { ...payment.metadata, cancellationReason: reason };
    }

    // Cancel scheduled payment
    this.cancelScheduledPayment(id);

    return true;
  }

  /**
   * Update recurring payment amount
   */
  updateRecurringPaymentAmount(id: string, newAmount: number): boolean {
    const payment = this.subscriptions.get(id);
    if (!payment || payment.status !== 'active') {
      return false;
    }

    payment.amount = newAmount;
    payment.updatedAt = new Date().toISOString();

    return true;
  }

  /**
   * Get recurring payment by ID
   */
  getRecurringPayment(id: string): RecurringPayment | null {
    return this.subscriptions.get(id) || null;
  }

  /**
   * Get all recurring payments for a customer
   */
  getCustomerRecurringPayments(customerId: string): RecurringPayment[] {
    return Array.from(this.subscriptions.values()).filter(
      payment => payment.customerId === customerId
    );
  }

  /**
   * Get all active recurring payments
   */
  getActiveRecurringPayments(): RecurringPayment[] {
    return Array.from(this.subscriptions.values()).filter(
      payment => payment.status === 'active'
    );
  }

  /**
   * Get subscription plans
   */
  getSubscriptionPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values()).filter(plan => plan.isActive);
  }

  /**
   * Get payment history for a recurring payment
   */
  getPaymentHistory(recurringPaymentId: string): RecurringPaymentHistory[] {
    return this.paymentHistory.get(recurringPaymentId) || [];
  }

  /**
   * Process a recurring payment
   */
  private async processPayment(id: string): Promise<void> {
    const payment = this.subscriptions.get(id);
    if (!payment || payment.status !== 'active') {
      return;
    }

    try {
      // Simulate payment processing
      const success = Math.random() > 0.1; // 90% success rate

      const paymentHistory: RecurringPaymentHistory = {
        id: `payment_hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        recurringPaymentId: id,
        amount: payment.amount,
        currency: payment.currency,
        status: success ? 'success' : 'failed',
        transactionId: success ? `tx_${Math.random().toString(36).substr(2, 9)}` : undefined,
        paymentDate: new Date().toISOString(),
        errorMessage: success ? undefined : 'Payment processing failed',
        createdAt: new Date().toISOString()
      };

      // Add to payment history
      const history = this.paymentHistory.get(id) || [];
      history.push(paymentHistory);
      this.paymentHistory.set(id, history);

      if (success) {
        // Update payment details
        payment.currentPayments += 1;
        payment.totalCollected += payment.amount;
        payment.lastPaymentDate = paymentHistory.paymentDate;

        // Check if subscription should end
        if (payment.maxPayments && payment.currentPayments >= payment.maxPayments) {
          payment.status = 'completed';
          payment.nextPaymentDate = '';
        } else {
          // Schedule next payment
          payment.nextPaymentDate = this.calculateNextPaymentDate(paymentHistory.paymentDate, payment.interval);
          this.schedulePayment(id);
        }
      } else {
        // Handle failed payment
        payment.status = 'failed';
        
        // Retry logic could be implemented here
        setTimeout(() => {
          if (this.subscriptions.get(id)?.status === 'failed') {
            this.schedulePayment(id); // Retry after delay
          }
        }, 24 * 60 * 60 * 1000); // Retry after 24 hours
      }

      payment.updatedAt = new Date().toISOString();

    } catch (error) {
      console.error(`Error processing payment ${id}:`, error);
      
      // Mark as failed
      payment.status = 'failed';
      payment.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Schedule a payment for processing
   */
  private schedulePayment(id: string): void {
    const payment = this.subscriptions.get(id);
    if (!payment || payment.status !== 'active') {
      return;
    }

    const nextPaymentDate = new Date(payment.nextPaymentDate);
    const now = new Date();
    const delay = nextPaymentDate.getTime() - now.getTime();

    if (delay > 0) {
      const timer = setTimeout(() => {
        this.processPayment(id);
      }, delay);

      this.paymentTimers.set(id, timer);
    } else {
      // Payment is due now or overdue
      this.processPayment(id);
    }
  }

  /**
   * Cancel a scheduled payment
   */
  private cancelScheduledPayment(id: string): void {
    const timer = this.paymentTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.paymentTimers.delete(id);
    }
  }

  /**
   * Start the payment scheduler
   */
  private startPaymentScheduler(): void {
    // Check for due payments every minute
    setInterval(() => {
      const now = new Date();
      this.getActiveRecurringPayments().forEach(payment => {
        const nextPaymentDate = new Date(payment.nextPaymentDate);
        if (nextPaymentDate <= now && !this.paymentTimers.has(payment.id)) {
          this.schedulePayment(payment.id);
        }
      });
    }, 60 * 1000); // Check every minute
  }

  /**
   * Get interval from frequency
   */
  private getIntervalFromFrequency(frequency: string): number {
    switch (frequency) {
      case 'daily': return 1;
      case 'weekly': return 7;
      case 'monthly': return 30;
      case 'quarterly': return 90;
      case 'yearly': return 365;
      default: return 30;
    }
  }

  /**
   * Calculate next payment date
   */
  private calculateNextPaymentDate(fromDate: string, interval: number): string {
    const date = new Date(fromDate);
    date.setDate(date.getDate() + interval);
    return date.toISOString();
  }

  /**
   * Get recurring payment analytics
   */
  getRecurringPaymentAnalytics(): RecurringPaymentAnalytics {
    const allPayments = Array.from(this.subscriptions.values());
    const activePayments = allPayments.filter(p => p.status === 'active');
    
    const monthlyRecurringRevenue = activePayments.reduce((total, payment) => {
      if (payment.frequency === 'monthly') {
        return total + payment.amount;
      }
      // Convert other frequencies to monthly equivalent
      const monthlyEquivalent = payment.amount * (30 / payment.interval);
      return total + monthlyEquivalent;
    }, 0);

    const totalHistory = Array.from(this.paymentHistory.values()).flat();
    const successfulPayments = totalHistory.filter(h => h.status === 'success');
    const failedPayments = totalHistory.filter(h => h.status === 'failed');

    const paymentSuccessRate = totalHistory.length > 0 
      ? (successfulPayments.length / totalHistory.length) * 100 
      : 0;

    const averageSubscriptionValue = activePayments.length > 0 
      ? activePayments.reduce((sum, p) => sum + p.amount, 0) / activePayments.length 
      : 0;

    const upcomingPayments = activePayments.filter(p => {
      const nextPayment = new Date(p.nextPaymentDate);
      const now = new Date();
      const daysUntilPayment = (nextPayment.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilPayment <= 7; // Within next 7 days
    }).length;

    return {
      totalSubscriptions: allPayments.length,
      activeSubscriptions: activePayments.length,
      monthlyRecurringRevenue,
      churnRate: 2.5, // Mock churn rate
      averageSubscriptionValue,
      paymentSuccessRate,
      upcomingPayments,
      failedPayments: failedPayments.length
    };
  }

  /**
   * Get upcoming payments
   */
  getUpcomingPayments(days: number = 7): RecurringPayment[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return this.getActiveRecurringPayments().filter(payment => {
      const nextPaymentDate = new Date(payment.nextPaymentDate);
      return nextPaymentDate >= now && nextPaymentDate <= futureDate;
    });
  }
}

// Export singleton instance
export const recurringPaymentService = new RecurringPaymentService();