// Tax Calculation Service for MobBitWallet
// This service handles tax calculations, tax rules, and compliance for different jurisdictions

export interface TaxRate {
  id: string;
  country: string;
  region?: string; // State, province, etc.
  name: string;
  rate: number; // Percentage (e.g., 8.5 for 8.5%)
  type: 'vat' | 'sales_tax' | 'gst' | 'income_tax' | 'crypto_tax';
  isCompound: boolean;
  isActive: boolean;
  validFrom: string;
  validTo?: string;
  description?: string;
}

export interface TaxRule {
  id: string;
  name: string;
  country: string;
  region?: string;
  taxType: 'standard' | 'reduced' | 'exempt' | 'zero_rated';
  conditions: TaxCondition[];
  applicableTaxRates: string[]; // Tax rate IDs
  priority: number;
  isActive: boolean;
}

export interface TaxCondition {
  field: 'amount' | 'currency' | 'customer_type' | 'product_type' | 'business_category';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals';
  value: string | number;
}

export interface TaxCalculation {
  id: string;
  amount: number;
  currency: string;
  country: string;
  region?: string;
  customerType: 'individual' | 'business' | 'non_profit';
  businessCategory?: string;
  productType?: string;
  taxBreakdown: TaxBreakdown[];
  totalTax: number;
  totalAmount: number;
  effectiveTaxRate: number;
  timestamp: string;
}

export interface TaxBreakdown {
  taxRateId: string;
  taxRateName: string;
  taxType: string;
  taxableAmount: number;
  taxAmount: number;
  rate: number;
}

export interface TaxExemption {
  id: string;
  name: string;
  country: string;
  region?: string;
  exemptionType: 'customer_type' | 'product_type' | 'amount_threshold' | 'business_category';
  exemptionValue: string | number;
  certificateRequired: boolean;
  validFrom: string;
  validTo?: string;
  description?: string;
}

export interface TaxReport {
  period: {
    start: string;
    end: string;
  };
  currency: string;
  totalTransactions: number;
  totalRevenue: number;
  totalTaxCollected: number;
  taxBreakdown: TaxBreakdown[];
  transactions: TaxTransaction[];
  generatedAt: string;
}

export interface TaxTransaction {
  id: string;
  amount: number;
  taxAmount: number;
  currency: string;
  country: string;
  region?: string;
  timestamp: string;
  customerType: string;
  taxRates: string[];
}

export interface TaxConfig {
  defaultCountry: string;
  autoDetectLocation: boolean;
  taxIncludedInPrices: boolean;
  roundTaxAmounts: boolean;
  taxExemptionEnabled: boolean;
  taxReportingEnabled: boolean;
  cryptoTaxTreatment: 'property' | 'currency' | 'commodity';
}

class TaxService {
  private taxRates: Map<string, TaxRate> = new Map();
  private taxRules: Map<string, TaxRule> = new Map();
  private taxExemptions: Map<string, TaxExemption> = new Map();
  private config: TaxConfig;
  private taxCalculations: Map<string, TaxCalculation> = new Map();

  constructor() {
    this.config = {
      defaultCountry: 'US',
      autoDetectLocation: true,
      taxIncludedInPrices: false,
      roundTaxAmounts: true,
      taxExemptionEnabled: true,
      taxReportingEnabled: true,
      cryptoTaxTreatment: 'property'
    };

    this.initializeTaxRates();
    this.initializeTaxRules();
    this.initializeTaxExemptions();
  }

  /**
   * Initialize default tax rates for different countries
   */
  private initializeTaxRates(): void {
    const defaultTaxRates: TaxRate[] = [
      // United States
      {
        id: 'us_federal_income',
        country: 'US',
        name: 'Federal Income Tax',
        rate: 0,
        type: 'income_tax',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'Federal income tax (varies by income bracket)'
      },
      {
        id: 'ca_state_sales',
        country: 'US',
        region: 'CA',
        name: 'California State Sales Tax',
        rate: 7.25,
        type: 'sales_tax',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'California state sales tax rate'
      },
      {
        id: 'ny_state_sales',
        country: 'US',
        region: 'NY',
        name: 'New York State Sales Tax',
        rate: 4.0,
        type: 'sales_tax',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'New York state sales tax rate'
      },

      // European Union VAT
      {
        id: 'eu_standard_vat',
        country: 'EU',
        name: 'EU Standard VAT',
        rate: 21.0,
        type: 'vat',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'Standard EU VAT rate'
      },
      {
        id: 'de_standard_vat',
        country: 'DE',
        name: 'Germany Standard VAT',
        rate: 19.0,
        type: 'vat',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'Germany standard VAT rate'
      },
      {
        id: 'fr_standard_vat',
        country: 'FR',
        name: 'France Standard VAT',
        rate: 20.0,
        type: 'vat',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'France standard VAT rate'
      },
      {
        id: 'uk_standard_vat',
        country: 'GB',
        name: 'UK Standard VAT',
        rate: 20.0,
        type: 'vat',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'United Kingdom standard VAT rate'
      },

      // Canada GST
      {
        id: 'ca_gst',
        country: 'CA',
        name: 'Canada Goods and Services Tax',
        rate: 5.0,
        type: 'gst',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'Canada federal GST rate'
      },
      {
        id: 'on_hst',
        country: 'CA',
        region: 'ON',
        name: 'Ontario HST',
        rate: 13.0,
        type: 'gst',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'Ontario Harmonized Sales Tax (includes GST)'
      },

      // Australia GST
      {
        id: 'au_gst',
        country: 'AU',
        name: 'Australia Goods and Services Tax',
        rate: 10.0,
        type: 'gst',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'Australia GST rate'
      },

      // Crypto-specific tax considerations
      {
        id: 'crypto_capital_gains',
        country: 'US',
        name: 'Crypto Capital Gains Tax',
        rate: 0,
        type: 'crypto_tax',
        isCompound: false,
        isActive: true,
        validFrom: '2024-01-01',
        description: 'Capital gains tax on cryptocurrency disposals'
      }
    ];

    defaultTaxRates.forEach(rate => {
      this.taxRates.set(rate.id, rate);
    });
  }

  /**
   * Initialize default tax rules
   */
  private initializeTaxRules(): void {
    const defaultTaxRules: TaxRule[] = [
      {
        id: 'eu_standard_rule',
        name: 'EU Standard VAT Rule',
        country: 'EU',
        taxType: 'standard',
        conditions: [
          { field: 'customer_type', operator: 'equals', value: 'business' },
          { field: 'amount', operator: 'greater_than', value: 0 }
        ],
        applicableTaxRates: ['eu_standard_vat'],
        priority: 1,
        isActive: true
      },
      {
        id: 'us_ca_sales_tax_rule',
        name: 'California Sales Tax Rule',
        country: 'US',
        region: 'CA',
        taxType: 'standard',
        conditions: [
          { field: 'customer_type', operator: 'equals', value: 'individual' },
          { field: 'amount', operator: 'greater_than', value: 0 }
        ],
        applicableTaxRates: ['ca_state_sales'],
        priority: 1,
        isActive: true
      },
      {
        id: 'crypto_standard_rule',
        name: 'Cryptocurrency Standard Tax Rule',
        country: 'US',
        taxType: 'standard',
        conditions: [
          { field: 'currency', operator: 'contains', value: 'BTC' },
          { field: 'amount', operator: 'greater_than', value: 600 } // IRS reporting threshold
        ],
        applicableTaxRates: ['crypto_capital_gains'],
        priority: 2,
        isActive: true
      }
    ];

    defaultTaxRules.forEach(rule => {
      this.taxRules.set(rule.id, rule);
    });
  }

  /**
   * Initialize tax exemptions
   */
  private initializeTaxExemptions(): void {
    const defaultExemptions: TaxExemption[] = [
      {
        id: 'non_profit_exemption',
        name: 'Non-Profit Organization Exemption',
        country: 'US',
        exemptionType: 'customer_type',
        exemptionValue: 'non_profit',
        certificateRequired: true,
        validFrom: '2024-01-01',
        description: 'Tax exemption for registered non-profit organizations'
      },
      {
        id: 'resale_exemption',
        name: 'Resale Exemption',
        country: 'US',
        exemptionType: 'business_category',
        exemptionValue: 'resale',
        certificateRequired: true,
        validFrom: '2024-01-01',
        description: 'Exemption for businesses purchasing for resale'
      },
      {
        id: 'eu_intra_community',
        name: 'EU Intra-Community Supply',
        country: 'EU',
        exemptionType: 'customer_type',
        exemptionValue: 'business',
        certificateRequired: true,
        validFrom: '2024-01-01',
        description: 'VAT exemption for intra-community supplies between EU businesses'
      }
    ];

    defaultExemptions.forEach(exemption => {
      this.taxExemptions.set(exemption.id, exemption);
    });
  }

  /**
   * Calculate tax for a transaction
   */
  calculateTax(request: {
    amount: number;
    currency: string;
    country?: string;
    region?: string;
    customerType?: 'individual' | 'business' | 'non_profit';
    businessCategory?: string;
    productType?: string;
  }): TaxCalculation {
    const {
      amount,
      currency,
      country = this.config.defaultCountry,
      region,
      customerType = 'individual',
      businessCategory,
      productType
    } = request;

    const calculationId = `tax_calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check for tax exemptions
    const exemption = this.checkTaxExemption({
      country,
      region,
      customerType,
      businessCategory,
      amount,
      currency
    });

    if (exemption) {
      return {
        id: calculationId,
        amount,
        currency,
        country,
        region,
        customerType,
        businessCategory,
        productType,
        taxBreakdown: [],
        totalTax: 0,
        totalAmount: amount,
        effectiveTaxRate: 0,
        timestamp: new Date().toISOString()
      };
    }

    // Find applicable tax rules
    const applicableRules = this.findApplicableTaxRules({
      country,
      region,
      customerType,
      businessCategory,
      productType,
      amount,
      currency
    });

    // Calculate tax breakdown
    const taxBreakdown: TaxBreakdown[] = [];
    let totalTax = 0;

    applicableRules.forEach(rule => {
      rule.applicableTaxRates.forEach(taxRateId => {
        const taxRate = this.taxRates.get(taxRateId);
        if (taxRate && taxRate.isActive) {
          const taxableAmount = amount;
          let taxAmount = (taxableAmount * taxRate.rate) / 100;

          // Handle compound tax
          if (taxRate.isCompound) {
            taxAmount = ((taxableAmount + totalTax) * taxRate.rate) / 100;
          }

          // Round tax amount if configured
          if (this.config.roundTaxAmounts) {
            taxAmount = Math.round(taxAmount * 100) / 100;
          }

          taxBreakdown.push({
            taxRateId: taxRate.id,
            taxRateName: taxRate.name,
            taxType: taxRate.type,
            taxableAmount,
            taxAmount,
            rate: taxRate.rate
          });

          totalTax += taxAmount;
        }
      });
    });

    const totalAmount = this.config.taxIncludedInPrices ? amount : amount + totalTax;
    const effectiveTaxRate = amount > 0 ? (totalTax / amount) * 100 : 0;

    const calculation: TaxCalculation = {
      id: calculationId,
      amount,
      currency,
      country,
      region,
      customerType,
      businessCategory,
      productType,
      taxBreakdown,
      totalTax,
      totalAmount,
      effectiveTaxRate,
      timestamp: new Date().toISOString()
    };

    this.taxCalculations.set(calculationId, calculation);
    return calculation;
  }

  /**
   * Check if transaction qualifies for tax exemption
   */
  private checkTaxExemption(params: {
    country: string;
    region?: string;
    customerType: string;
    businessCategory?: string;
    amount: number;
    currency: string;
  }): TaxExemption | null {
    if (!this.config.taxExemptionEnabled) {
      return null;
    }

    for (const exemption of this.taxExemptions.values()) {
      if (!exemption.isActive) continue;

      // Check country match
      if (exemption.country !== params.country) continue;

      // Check region match if specified
      if (exemption.region && exemption.region !== params.region) continue;

      // Check exemption condition
      let isExempt = false;
      switch (exemption.exemptionType) {
        case 'customer_type':
          isExempt = exemption.exemptionValue === params.customerType;
          break;
        case 'business_category':
          isExempt = exemption.exemptionValue === params.businessCategory;
          break;
        case 'amount_threshold':
          isExempt = params.amount >= Number(exemption.exemptionValue);
          break;
      }

      if (isExempt) {
        return exemption;
      }
    }

    return null;
  }

  /**
   * Find applicable tax rules for a transaction
   */
  private findApplicableTaxRules(params: {
    country: string;
    region?: string;
    customerType: string;
    businessCategory?: string;
    productType?: string;
    amount: number;
    currency: string;
  }): TaxRule[] {
    const applicableRules: TaxRule[] = [];

    for (const rule of this.taxRules.values()) {
      if (!rule.isActive) continue;

      // Check country match
      if (rule.country !== params.country) continue;

      // Check region match if specified
      if (rule.region && rule.region !== params.region) continue;

      // Check all conditions
      const conditionsMet = rule.conditions.every(condition => {
        return this.evaluateCondition(condition, params);
      });

      if (conditionsMet) {
        applicableRules.push(rule);
      }
    }

    // Sort by priority (higher priority first)
    return applicableRules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Evaluate a single tax condition
   */
  private evaluateCondition(condition: TaxCondition, params: any): boolean {
    const fieldValue = this.getFieldValue(condition.field, params);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      default:
        return false;
    }
  }

  /**
   * Get field value from params
   */
  private getFieldValue(field: string, params: any): any {
    switch (field) {
      case 'amount':
        return params.amount;
      case 'currency':
        return params.currency;
      case 'customer_type':
        return params.customerType;
      case 'product_type':
        return params.productType;
      case 'business_category':
        return params.businessCategory;
      default:
        return null;
    }
  }

  /**
   * Get tax rates for a country/region
   */
  getTaxRates(country: string, region?: string): TaxRate[] {
    return Array.from(this.taxRates.values()).filter(rate => 
      rate.isActive && 
      rate.country === country && 
      (!region || rate.region === region)
    );
  }

  /**
   * Add custom tax rate
   */
  addTaxRate(taxRate: Omit<TaxRate, 'id'>): TaxRate {
    const id = `tax_rate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTaxRate: TaxRate = { ...taxRate, id };
    this.taxRates.set(id, newTaxRate);
    return newTaxRate;
  }

  /**
   * Generate tax report for a period
   */
  generateTaxReport(period: { start: string; end: string }, currency: string): TaxReport {
    const calculations = Array.from(this.taxCalculations.values()).filter(calc => {
      const calcDate = new Date(calc.timestamp);
      const startDate = new Date(period.start);
      const endDate = new Date(period.end);
      return calcDate >= startDate && calcDate <= endDate && calc.currency === currency;
    });

    const totalTransactions = calculations.length;
    const totalRevenue = calculations.reduce((sum, calc) => sum + calc.amount, 0);
    const totalTaxCollected = calculations.reduce((sum, calc) => sum + calc.totalTax, 0);

    // Aggregate tax breakdown
    const taxBreakdownMap = new Map<string, TaxBreakdown>();
    calculations.forEach(calc => {
      calc.taxBreakdown.forEach(breakdown => {
        const existing = taxBreakdownMap.get(breakdown.taxRateId);
        if (existing) {
          existing.taxableAmount += breakdown.taxableAmount;
          existing.taxAmount += breakdown.taxAmount;
        } else {
          taxBreakdownMap.set(breakdown.taxRateId, { ...breakdown });
        }
      });
    });

    const taxBreakdown = Array.from(taxBreakdownMap.values());

    // Generate transactions for report
    const transactions: TaxTransaction[] = calculations.map(calc => ({
      id: calc.id,
      amount: calc.amount,
      taxAmount: calc.totalTax,
      currency: calc.currency,
      country: calc.country,
      region: calc.region,
      timestamp: calc.timestamp,
      customerType: calc.customerType,
      taxRates: calc.taxBreakdown.map(b => b.taxRateId)
    }));

    return {
      period,
      currency,
      totalTransactions,
      totalRevenue,
      totalTaxCollected,
      taxBreakdown,
      transactions,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Get tax configuration
   */
  getConfig(): TaxConfig {
    return { ...this.config };
  }

  /**
   * Update tax configuration
   */
  updateConfig(newConfig: Partial<TaxConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get tax calculation by ID
   */
  getTaxCalculation(id: string): TaxCalculation | null {
    return this.taxCalculations.get(id) || null;
  }

  /**
   * Get crypto tax guidance
   */
  getCryptoTaxGuidance(country: string): {
    treatment: string;
    reportingThreshold: number;
    recordKeeping: string[];
    importantNotes: string[];
  } {
    const guidance = {
      US: {
        treatment: 'Property',
        reportingThreshold: 600,
        recordKeeping: [
          'Date of acquisition',
          'Cost basis',
          'Date of disposal',
          'Fair market value at disposal',
          'Transaction fees'
        ],
        importantNotes: [
          'Cryptocurrency is treated as property for tax purposes',
          'Capital gains tax applies to disposals',
          'Form 8949 required for reporting',
          'Wash sale rules do not apply to crypto'
        ]
      },
      EU: {
        treatment: 'VAT Applicable',
        reportingThreshold: 0,
        recordKeeping: [
          'Transaction dates',
          'Amounts in local currency',
          'Counterparty information',
          'Purpose of transaction'
        ],
        importantNotes: [
          'VAT may apply to crypto-to-fiat conversions',
          'Member states have different regulations',
          'MiCA regulation provides framework',
          'DAC8 reporting requirements'
        ]
      }
    };

    return guidance[country as keyof typeof guidance] || guidance.US;
  }
}

// Export singleton instance
export const taxService = new TaxService();