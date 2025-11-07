// Fraud Detection Mechanisms Service for MobBitWallet
// This service handles real-time fraud detection, pattern recognition, and risk scoring

export interface FraudDetectionRule {
  id: string;
  name: string;
  description: string;
  type: FraudRuleType;
  condition: FraudCondition;
  action: FraudAction;
  severity: FraudSeverity;
  enabled: boolean;
  weight: number; // Importance score for overall risk calculation
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FraudCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_equals' | 'regex' | 'in' | 'not_in';
  value: any;
  timeWindow?: number; // minutes
}

export interface FraudAction {
  type: 'block' | 'flag' | 'require_mfa' | 'limit' | 'freeze' | 'notify' | 'escalate';
  parameters?: Record<string, any>;
}

export interface FraudAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  transactionId?: string;
  userId?: string;
  sessionId?: string;
  severity: FraudSeverity;
  riskScore: number;
  description: string;
  details: Record<string, any>;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface FraudCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  alerts: FraudAlert[];
  status: CaseStatus;
  priority: CasePriority;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  estimatedLoss?: number;
  preventedLoss?: number;
  tags: string[];
}

export interface TransactionPattern {
  id: string;
  userId: string;
  patternType: PatternType;
  description: string;
  confidence: number; // 0-1
  detectedAt: string;
  isActive: boolean;
  data: PatternData;
}

export interface PatternData {
  frequency: number;
  amount: number;
  timeWindow: number;
  locations: string[];
  devices: string[];
  counterparties: string[];
}

export interface RiskScore {
  overallScore: number;
  factors: RiskFactor[];
  level: RiskLevel;
  confidence: number;
  timestamp: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  description: string;
  category: RiskCategory;
  severity: FraudSeverity;
  weight: number;
}

export interface BehavioralProfile {
  userId: string;
  typicalTransactionAmount: number;
  typicalTransactionFrequency: number;
  usualLocations: string[];
  usualDevices: string[];
  usualTimes: number[];
  counterparties: string[];
  riskTolerance: RiskTolerance;
  lastUpdated: string;
}

export interface MachineLearningModel {
  id: string;
  name: string;
  type: ModelType;
  version: string;
  accuracy: number;
  lastTrained: string;
  isActive: boolean;
  features: string[];
}

export type FraudRuleType = 
  | 'velocity' 
  | 'location' 
  | 'device' 
  | 'amount' 
  | 'behavior' 
  | 'pattern' 
  | 'identity' 
  | 'network' 
  | 'compliance';

export type FraudSeverity = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type AlertStatus = 
  | 'open' 
  | 'investigating' 
  | 'resolved' 
  | 'false_positive' 
  | 'escalated';

export type CaseStatus = 
  | 'open' 
  | 'investigating' 
  | 'resolved' 
  | 'closed' 
  | 'escalated';

export type CasePriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type PatternType = 
  | 'circular_transactions' 
  | 'rapid_fire' 
  | 'unusual_amounts' 
  | 'location_anomaly' 
  | 'device_anomaly' 
  | 'time_anomaly' 
  | 'counterparty_anomaly';

export type RiskLevel = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type RiskCategory = 
  | 'transaction' 
  | 'identity' 
  | 'device' 
  | 'location' 
  | 'behavior' 
  | 'network' 
  | 'compliance';

export type RiskTolerance = 
  | 'conservative' 
  | 'moderate' 
  | 'aggressive';

export type ModelType = 
  | 'isolation_forest' 
  | 'neural_network' 
  | 'random_forest' 
  | 'gradient_boosting' 
  | 'anomaly_detection';

export interface FraudDetectionConfig {
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  autoBlockEnabled: boolean;
  mfaRequiredForHighRisk: boolean;
  realTimeMonitoring: boolean;
  behavioralAnalysisEnabled: boolean;
  machineLearningEnabled: boolean;
  alertEscalationRules: AlertEscalationRule[];
  dataRetentionDays: number;
}

export interface AlertEscalationRule {
  severity: FraudSeverity;
  timeframe: number; // minutes
  action: 'notify_admin' | 'block_account' | 'require_manual_review';
}

class FraudDetectionService {
  private rules: Map<string, FraudDetectionRule> = new Map();
  private alerts: FraudAlert[] = [];
  private cases: Map<string, FraudCase> = new Map();
  private behavioralProfiles: Map<string, BehavioralProfile> = new Map();
  private transactionPatterns: Map<string, TransactionPattern[]> = new Map();
  private mlModels: Map<string, MachineLearningModel> = new Map();
  private config: FraudDetectionConfig;

  constructor() {
    this.config = {
      riskThresholds: {
        low: 30,
        medium: 60,
        high: 80,
        critical: 95
      },
      autoBlockEnabled: true,
      mfaRequiredForHighRisk: true,
      realTimeMonitoring: true,
      behavioralAnalysisEnabled: true,
      machineLearningEnabled: true,
      alertEscalationRules: [
        {
          severity: 'critical',
          timeframe: 15,
          action: 'block_account'
        },
        {
          severity: 'high',
          timeframe: 60,
          action: 'require_manual_review'
        }
      ],
      dataRetentionDays: 365
    };

    this.initializeFraudRules();
    this.initializeMachineLearningModels();
    this.startRealTimeMonitoring();
  }

  /**
   * Initialize fraud detection rules
   */
  private initializeFraudRules(): void {
    const rules: FraudDetectionRule[] = [
      {
        id: 'high_velocity_rule',
        name: 'High Transaction Velocity',
        description: 'Multiple transactions in short time period',
        type: 'velocity',
        condition: {
          field: 'transaction_count',
          operator: 'greater_than',
          value: 10,
          timeWindow: 5 // 5 minutes
        },
        action: {
          type: 'flag',
          parameters: { reason: 'High transaction velocity detected' }
        },
        severity: 'high',
        enabled: true,
        weight: 25,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'unusual_location_rule',
        name: 'Unusual Location',
        description: 'Transaction from unusual geographic location',
        type: 'location',
        condition: {
          field: 'location',
          operator: 'not_in',
          value: 'usual_locations'
        },
        action: {
          type: 'require_mfa',
          parameters: { reason: 'Unusual location detected' }
        },
        severity: 'medium',
        enabled: true,
        weight: 20,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'large_amount_rule',
        name: 'Large Transaction Amount',
        description: 'Transaction amount exceeds user threshold',
        type: 'amount',
        condition: {
          field: 'amount',
          operator: 'greater_than',
          value: 10000
        },
        action: {
          type: 'flag',
          parameters: { reason: 'Large transaction amount' }
        },
        severity: 'medium',
        enabled: true,
        weight: 15,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'new_device_rule',
        name: 'New Device Detection',
        description: 'Transaction from unrecognized device',
        type: 'device',
        condition: {
          field: 'device_fingerprint',
          operator: 'not_in',
          value: 'known_devices'
        },
        action: {
          type: 'require_mfa',
          parameters: { reason: 'New device detected' }
        },
        severity: 'low',
        enabled: true,
        weight: 10,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'circular_transaction_rule',
        name: 'Circular Transaction Pattern',
        description: 'Suspicious circular transaction pattern detected',
        type: 'pattern',
        condition: {
          field: 'circular_pattern',
          operator: 'equals',
          value: true
        },
        action: {
          type: 'block',
          parameters: { reason: 'Circular transaction pattern detected' }
        },
        severity: 'critical',
        enabled: true,
        weight: 40,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'unusual_time_rule',
        name: 'Unusual Transaction Time',
        description: 'Transaction outside usual time patterns',
        type: 'behavior',
        condition: {
          field: 'transaction_hour',
          operator: 'not_in',
          value: 'usual_hours'
        },
        action: {
          type: 'flag',
          parameters: { reason: 'Unusual transaction time' }
        },
        severity: 'low',
        enabled: true,
        weight: 5,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'multiple_failed_attempts_rule',
        name: 'Multiple Failed Attempts',
        description: 'Multiple failed transaction attempts',
        type: 'behavior',
        condition: {
          field: 'failed_attempts',
          operator: 'greater_than',
          value: 5,
          timeWindow: 15 // 15 minutes
        },
        action: {
          type: 'freeze',
          parameters: { reason: 'Multiple failed attempts', duration: 30 } // 30 minutes
        },
        severity: 'high',
        enabled: true,
        weight: 30,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'suspicious_ip_rule',
        name: 'Suspicious IP Address',
        description: 'Transaction from known suspicious IP address',
        type: 'network',
        condition: {
          field: 'ip_address',
          operator: 'in',
          value: 'suspicious_ips'
        },
        action: {
          type: 'block',
          parameters: { reason: 'Suspicious IP address' }
        },
        severity: 'critical',
        enabled: true,
        weight: 50,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Initialize machine learning models
   */
  private initializeMachineLearningModels(): void {
    const models: MachineLearningModel[] = [
      {
        id: 'anomaly_detection_model',
        name: 'Transaction Anomaly Detection',
        type: 'anomaly_detection',
        version: '1.2.0',
        accuracy: 0.94,
        lastTrained: new Date().toISOString(),
        isActive: true,
        features: ['amount', 'frequency', 'location', 'device', 'time']
      },
      {
        id: 'behavioral_analysis_model',
        name: 'Behavioral Analysis',
        type: 'neural_network',
        version: '2.1.0',
        accuracy: 0.87,
        lastTrained: new Date().toISOString(),
        isActive: true,
        features: ['transaction_history', 'device_usage', 'location_patterns', 'time_patterns']
      },
      {
        id: 'network_analysis_model',
        name: 'Network Analysis',
        type: 'random_forest',
        version: '1.5.0',
        accuracy: 0.91,
        lastTrained: new Date().toISOString(),
        isActive: true,
        features: ['counterparty_network', 'transaction_graph', 'circular_patterns']
      }
    ];

    models.forEach(model => {
      this.mlModels.set(model.id, model);
    });
  }

  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    if (this.config.realTimeMonitoring) {
      // Simulate real-time monitoring with interval
      setInterval(() => {
        this.performRealTimeAnalysis();
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Analyze transaction for fraud
   */
  async analyzeTransaction(transaction: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    ipAddress: string;
    deviceFingerprint: string;
    location: string;
    timestamp: string;
    counterparty?: string;
    metadata?: Record<string, any>;
  }): Promise<{ riskScore: RiskScore; alerts: FraudAlert[]; actionRequired: boolean }> {
    const alerts: FraudAlert[] = [];
    let totalRiskScore = 0;
    const riskFactors: RiskFactor[] = [];

    // Get user's behavioral profile
    const behavioralProfile = this.getOrCreateBehavioralProfile(transaction.userId);

    // Check each fraud rule
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const ruleResult = this.evaluateRule(rule, transaction, behavioralProfile);
      if (ruleResult.triggered) {
        totalRiskScore += rule.weight;
        
        // Create risk factor
        riskFactors.push({
          name: rule.name,
          score: rule.weight,
          description: rule.description,
          category: this.getRuleCategory(rule.type),
          severity: rule.severity,
          weight: rule.weight
        });

        // Create fraud alert
        const alert: FraudAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          ruleName: rule.name,
          transactionId: transaction.id,
          userId: transaction.userId,
          severity: rule.severity,
          riskScore: rule.weight,
          description: rule.description,
          details: ruleResult.details,
          status: 'open',
          createdAt: new Date().toISOString()
        };

        alerts.push(alert);
        this.alerts.push(alert);

        // Update rule trigger count
        rule.triggerCount++;
        rule.lastTriggered = new Date().toISOString();
      }
    }

    // Machine learning analysis
    if (this.config.machineLearningEnabled) {
      const mlRiskScore = await this.performMachineLearningAnalysis(transaction, behavioralProfile);
      totalRiskScore += mlRiskScore.score;
      riskFactors.push(...mlRiskScore.factors);
    }

    // Behavioral analysis
    if (this.config.behavioralAnalysisEnabled) {
      const behavioralRiskScore = this.performBehavioralAnalysis(transaction, behavioralProfile);
      totalRiskScore += behavioralRiskScore.score;
      riskFactors.push(...behavioralRiskScore.factors);
    }

    // Cap risk score at 100
    totalRiskScore = Math.min(totalRiskScore, 100);

    // Determine risk level
    let riskLevel: RiskLevel = 'low';
    if (totalRiskScore >= this.config.riskThresholds.critical) {
      riskLevel = 'critical';
    } else if (totalRiskScore >= this.config.riskThresholds.high) {
      riskLevel = 'high';
    } else if (totalRiskScore >= this.config.riskThresholds.medium) {
      riskLevel = 'medium';
    }

    const riskScore: RiskScore = {
      overallScore: totalRiskScore,
      factors: riskFactors,
      level: riskLevel,
      confidence: 0.85, // Simplified confidence calculation
      timestamp: new Date().toISOString()
    };

    // Determine if action is required
    const actionRequired = this.isActionRequired(riskScore, alerts);

    // Update behavioral profile with new transaction data
    this.updateBehavioralProfile(transaction.userId, transaction);

    return { riskScore, alerts, actionRequired };
  }

  /**
   * Evaluate fraud rule against transaction
   */
  private evaluateRule(rule: FraudDetectionRule, transaction: any, behavioralProfile: BehavioralProfile): { triggered: boolean; details: Record<string, any> } {
    const details: Record<string, any> = {};

    switch (rule.condition.field) {
      case 'transaction_count':
        // Check transaction velocity (simplified)
        const recentTransactions = this.getRecentTransactions(transaction.userId, rule.condition.timeWindow);
        details.transactionCount = recentTransactions.length;
        return {
          triggered: recentTransactions.length > rule.condition.value,
          details
        };

      case 'location':
        // Check if location is unusual
        const isUnusualLocation = !behavioralProfile.usualLocations.includes(transaction.location);
        details.usualLocations = behavioralProfile.usualLocations;
        details.currentLocation = transaction.location;
        return {
          triggered: isUnusualLocation,
          details
        };

      case 'amount':
        // Check if amount is unusual for user
        const amountThreshold = behavioralProfile.typicalTransactionAmount * 5; // 5x typical amount
        details.typicalAmount = behavioralProfile.typicalTransactionAmount;
        details.currentAmount = transaction.amount;
        details.threshold = amountThreshold;
        return {
          triggered: transaction.amount > amountThreshold,
          details
        };

      case 'device_fingerprint':
        // Check if device is recognized
        const isKnownDevice = behavioralProfile.usualDevices.includes(transaction.deviceFingerprint);
        details.knownDevices = behavioralProfile.usualDevices;
        details.currentDevice = transaction.deviceFingerprint;
        return {
          triggered: !isKnownDevice,
          details
        };

      case 'circular_pattern':
        // Check for circular transactions (simplified)
        const isCircular = this.detectCircularPattern(transaction);
        details.isCircular = isCircular;
        return {
          triggered: isCircular,
          details
        };

      case 'transaction_hour':
        // Check if transaction time is unusual
        const currentHour = new Date(transaction.timestamp).getHours();
        const isUnusualTime = !behavioralProfile.usualTimes.includes(currentHour);
        details.usualHours = behavioralProfile.usualTimes;
        details.currentHour = currentHour;
        return {
          triggered: isUnusualTime,
          details
        };

      case 'failed_attempts':
        // Check for multiple failed attempts
        const failedAttempts = this.getFailedAttempts(transaction.userId, rule.condition.timeWindow);
        details.failedAttempts = failedAttempts;
        return {
          triggered: failedAttempts > rule.condition.value,
          details
        };

      case 'ip_address':
        // Check if IP is in suspicious list (simplified)
        const suspiciousIPs = ['192.168.1.100', '10.0.0.1']; // Example suspicious IPs
        details.isSuspiciousIP = suspiciousIPs.includes(transaction.ipAddress);
        return {
          triggered: suspiciousIPs.includes(transaction.ipAddress),
          details
        };

      default:
        return { triggered: false, details };
    }
  }

  /**
   * Perform machine learning analysis
   */
  private async performMachineLearningAnalysis(transaction: any, behavioralProfile: BehavioralProfile): Promise<{ score: number; factors: RiskFactor[] }> {
    const factors: RiskFactor[] = [];
    let score = 0;

    // Simulate ML model analysis
    for (const model of this.mlModels.values()) {
      if (!model.isActive) continue;

      // Simulate model prediction
      const prediction = Math.random(); // Random prediction for demo
      const modelScore = prediction > 0.7 ? 20 : 0; // High risk if prediction > 0.7

      if (modelScore > 0) {
        score += modelScore;
        factors.push({
          name: `${model.name} Risk`,
          score: modelScore,
          description: `ML model detected anomalous pattern`,
          category: 'behavior',
          severity: 'medium',
          weight: modelScore
        });
      }
    }

    return { score, factors };
  }

  /**
   * Perform behavioral analysis
   */
  private performBehavioralAnalysis(
    transaction: any, 
    behavioralProfile: BehavioralProfile
  ): { score: number; factors: RiskFactor[] } {
    const factors: RiskFactor[] = [];
    let score = 0;

    // Amount deviation analysis
    const amountDeviation = Math.abs(transaction.amount - behavioralProfile.typicalTransactionAmount) / behavioralProfile.typicalTransactionAmount;
    if (amountDeviation > 2) { // More than 2x deviation
      score += 15;
      factors.push({
        name: 'Amount Deviation',
        score: 15,
        description: `Transaction amount deviates significantly from usual`,
        category: 'behavior',
        severity: 'medium',
        weight: 15
      });
    }

    // Time deviation analysis
    const currentHour = new Date(transaction.timestamp).getHours();
    const isUnusualTime = !behavioralProfile.usualTimes.includes(currentHour);
    if (isUnusualTime) {
      score += 5;
      factors.push({
        name: 'Time Deviation',
        score: 5,
        description: `Transaction at unusual time`,
        category: 'behavior',
        severity: 'low',
        weight: 5
      });
    }

    return { score, factors };
  }

  /**
   * Check if action is required based on risk score and alerts
   */
  private isActionRequired(riskScore: RiskScore, alerts: FraudAlert[]): boolean {
    // Action required if risk score is high or critical
    if (riskScore.level === 'high' || riskScore.level === 'critical') {
      return true;
    }

    // Action required if there are critical alerts
    if (alerts.some(alert => alert.severity === 'critical')) {
      return true;
    }

    return false;
  }

  /**
   * Get or create behavioral profile for user
   */
  private getOrCreateBehavioralProfile(userId: string): BehavioralProfile {
    let profile = this.behavioralProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        typicalTransactionAmount: 100, // Default value
        typicalTransactionFrequency: 1, // Default value
        usualLocations: ['New York', 'San Francisco'], // Default locations
        usualDevices: ['device_default'], // Default device
        usualTimes: [9, 10, 11, 14, 15, 16], // Business hours
        counterparties: [],
        riskTolerance: 'moderate',
        lastUpdated: new Date().toISOString()
      };
      
      this.behavioralProfiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * Update behavioral profile with new transaction data
   */
  private updateBehavioralProfile(userId: string, transaction: any): void {
    const profile = this.behavioralProfiles.get(userId);
    if (!profile) return;

    // Update typical transaction amount (moving average)
    profile.typicalTransactionAmount = (profile.typicalTransactionAmount * 0.8) + (transaction.amount * 0.2);

    // Add new location if not already present
    if (!profile.usualLocations.includes(transaction.location)) {
      profile.usualLocations.push(transaction.location);
      // Keep only last 5 locations
      if (profile.usualLocations.length > 5) {
        profile.usualLocations = profile.usualLocations.slice(-5);
      }
    }

    // Add new device if not already present
    if (!profile.usualDevices.includes(transaction.deviceFingerprint)) {
      profile.usualDevices.push(transaction.deviceFingerprint);
      // Keep only last 3 devices
      if (profile.usualDevices.length > 3) {
        profile.usualDevices = profile.usualDevices.slice(-3);
      }
    }

    // Update transaction time patterns
    const transactionHour = new Date(transaction.timestamp).getHours();
    if (!profile.usualTimes.includes(transactionHour)) {
      profile.usualTimes.push(transactionHour);
      // Keep only last 10 time slots
      if (profile.usualTimes.length > 10) {
        profile.usualTimes = profile.usualTimes.slice(-10);
      }
    }

    // Add counterparty if provided
    if (transaction.counterparty && !profile.counterparties.includes(transaction.counterparty)) {
      profile.counterparties.push(transaction.counterparty);
    }

    profile.lastUpdated = new Date().toISOString();
  }

  /**
   * Get recent transactions for user (simplified)
   */
  private getRecentTransactions(userId: string, timeWindow: number): any[] {
    // In real implementation, this would query the database
    // For demo, return mock data
    return Array.from({ length: Math.floor(Math.random() * 15) }, (_, i) => ({
      id: `tx_${i}`,
      timestamp: new Date(Date.now() - Math.random() * timeWindow * 60 * 1000).toISOString()
    }));
  }

  /**
   * Detect circular transaction pattern (simplified)
   */
  private detectCircularPattern(transaction: any): boolean {
    // In real implementation, this would analyze transaction graphs
    // For demo, return random result
    return Math.random() < 0.05; // 5% chance of circular pattern
  }

  /**
   * Get failed attempts for user (simplified)
   */
  private getFailedAttempts(userId: string, timeWindow: number): number {
    // In real implementation, this would query the database
    // For demo, return random number
    return Math.floor(Math.random() * 10);
  }

  /**
   * Get rule category from rule type
   */
  private getRuleCategory(ruleType: FraudRuleType): RiskCategory {
    const categoryMap: Record<FraudRuleType, RiskCategory> = {
      velocity: 'transaction',
      location: 'location',
      device: 'device',
      amount: 'transaction',
      behavior: 'behavior',
      pattern: 'network',
      identity: 'identity',
      network: 'network',
      compliance: 'compliance'
    };

    return categoryMap[ruleType] || 'transaction';
  }

  /**
   * Perform real-time analysis (called by monitoring interval)
   */
  private performRealTimeAnalysis(): void {
    // In real implementation, this would analyze incoming transactions in real-time
    // For demo, this is a placeholder
    console.log('Performing real-time fraud analysis...');
  }

  /**
   * Create fraud case from alerts
   */
  createFraudCase(alertIds: string[], title: string, description: string): FraudCase {
    const caseId = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const caseNumber = `FC-${Date.now()}`;
    
    const relatedAlerts = this.alerts.filter(alert => alertIds.includes(alert.id));
    
    // Determine priority based on alerts
    const hasCriticalAlert = relatedAlerts.some(alert => alert.severity === 'critical');
    const hasHighAlert = relatedAlerts.some(alert => alert.severity === 'high');
    
    let priority: CasePriority = 'medium';
    if (hasCriticalAlert) priority = 'critical';
    else if (hasHighAlert) priority = 'high';

    const fraudCase: FraudCase = {
      id: caseId,
      caseNumber,
      title,
      description,
      alerts: relatedAlerts,
      status: 'open',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['auto-generated', 'fraud-detection']
    };

    this.cases.set(caseId, fraudCase);

    // Update alert statuses
    relatedAlerts.forEach(alert => {
      alert.status = 'investigating';
    });

    return fraudCase;
  }

  /**
   * Get fraud statistics
   */
  getFraudStats(): {
    totalAlerts: number;
    openAlerts: number;
    resolvedAlerts: number;
    totalCases: number;
    openCases: number;
    averageRiskScore: number;
    topRuleTypes: Array<{ type: string; count: number }>;
  } {
    const totalAlerts = this.alerts.length;
    const openAlerts = this.alerts.filter(alert => alert.status === 'open').length;
    const resolvedAlerts = this.alerts.filter(alert => alert.status === 'resolved').length;

    const totalCases = this.cases.size;
    const openCases = Array.from(this.cases.values()).filter(c => c.status === 'open').length;

    // Calculate average risk score from alerts
    const averageRiskScore = this.alerts.length > 0 
      ? this.alerts.reduce((sum, alert) => sum + alert.riskScore, 0) / this.alerts.length 
      : 0;

    // Get top rule types
    const ruleTypeCounts = new Map<string, number>();
    this.alerts.forEach(alert => {
      const rule = this.rules.get(alert.ruleId);
      if (rule) {
        const count = ruleTypeCounts.get(rule.type) || 0;
        ruleTypeCounts.set(rule.type, count + 1);
      }
    });

    const topRuleTypes = Array.from(ruleTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAlerts,
      openAlerts,
      resolvedAlerts,
      totalCases,
      openCases,
      averageRiskScore,
      topRuleTypes
    };
  }

  /**
   * Get configuration
   */
  getConfig(): FraudDetectionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FraudDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get active fraud rules
   */
  getActiveRules(): FraudDetectionRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.enabled);
  }

  /**
   * Toggle rule enabled status
   */
  toggleRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = !rule.enabled;
    rule.updatedAt = new Date().toISOString();
    return true;
  }

  /**
   * Get fraud alerts for user
   */
  getUserAlerts(userId: string, limit: number = 50): FraudAlert[] {
    return this.alerts
      .filter(alert => alert.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Resolve fraud alert
   */
  resolveAlert(alertId: string, resolutionNotes: string, resolvedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = resolvedBy;
    alert.resolutionNotes = resolutionNotes;

    return true;
  }
}

// Export singleton instance
export const fraudDetectionService = new FraudDetectionService();