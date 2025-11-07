"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  QrCode, 
  CreditCard, 
  Zap, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  Copy,
  Download,
  Eye,
  Users,
  Package,
  Receipt,
  Bell,
  Shield,
  Smartphone,
  Monitor,
  Calendar,
  Pause,
  Play,
  X,
  TrendingUp,
  UserPlus,
  Calculator
} from "lucide-react";
import { 
  recurringPaymentService, 
  type RecurringPayment, 
  type SubscriptionPlan,
  type RecurringPaymentHistory 
} from "@/lib/recurring-payment";
import { 
  currencyService, 
  type MultiCurrencyPrice 
} from "@/lib/currency-service";
import { 
  taxService, 
  type TaxCalculation 
} from "@/lib/tax-service";
import { 
  paymentVerificationService, 
  type PaymentVerification 
} from "@/lib/payment-verification-service";
import { 
  fraudDetectionService, 
  type FraudAlert 
} from "@/lib/fraud-detection-service";

interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  paymentMethod: 'bitcoin' | 'lightning';
  createdAt: string;
  expiresAt: string;
  qrCode?: string;
}

interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'awaiting_payment' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'bitcoin' | 'lightning';
  customerInfo?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("create");
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<PaymentSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentRequest | null>(null);

  // Recurring payments state
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [showCreateRecurring, setShowCreateRecurring] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [recurringFormData, setRecurringFormData] = useState({
    customerName: "",
    customerEmail: "",
    amount: "",
    currency: "USD",
    description: "",
    frequency: "monthly" as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    paymentMethod: "lightning" as 'bitcoin' | 'lightning',
    startDate: "",
    maxPayments: ""
  });

  // Multi-currency state
  const [multiCurrencyPrices, setMultiCurrencyPrices] = useState<MultiCurrencyPrice | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [converterAmount, setConverterAmount] = useState("");
  const [converterFrom, setConverterFrom] = useState("USD");
  const [converterTo, setConverterTo] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  // Tax calculation state
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [taxFormData, setTaxFormData] = useState({
    amount: "",
    currency: "USD",
    country: "US",
    region: "",
    customerType: "individual" as 'individual' | 'business' | 'non_profit',
    businessCategory: ""
  });

  // Payment verification state
  const [paymentVerifications, setPaymentVerifications] = useState<PaymentVerification[]>([]);
  const [showVerificationDetails, setShowVerificationDetails] = useState<string | null>(null);
  const [verificationStats, setVerificationStats] = useState<any>(null);

  // Fraud detection state
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [fraudStats, setFraudStats] = useState<any>(null);
  const [showFraudDetails, setShowFraudDetails] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    description: "",
    customerEmail: "",
    paymentMethod: "lightning" as 'bitcoin' | 'lightning',
    expiryHours: "24"
  });

  useEffect(() => {
    loadPaymentData();
    loadRecurringPaymentsData();
    loadMultiCurrencyData();
    loadVerificationData();
    loadFraudDetectionData();
  }, []);

  const loadFraudDetectionData = () => {
    // Load fraud statistics
    const stats = fraudDetectionService.getFraudStats();
    setFraudStats(stats);

    // Load mock fraud alerts
    const mockFraudAlerts: FraudAlert[] = [
      {
        id: 'alert_1',
        ruleId: 'high_velocity_rule',
        ruleName: 'High Transaction Velocity',
        transactionId: 'tx_123',
        userId: 'user_456',
        severity: 'high' as any,
        riskScore: 25,
        description: 'Multiple transactions in short time period',
        details: {
          transactionCount: 12,
          timeWindow: 5,
          transactions: ['tx_120', 'tx_121', 'tx_122']
        },
        status: 'open' as any,
        createdAt: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      },
      {
        id: 'alert_2',
        ruleId: 'unusual_location_rule',
        ruleName: 'Unusual Location',
        transactionId: 'tx_124',
        userId: 'user_789',
        severity: 'medium' as any,
        riskScore: 20,
        description: 'Transaction from unusual geographic location',
        details: {
          currentLocation: 'Moscow, Russia',
          usualLocations: ['New York, USA', 'San Francisco, USA'],
          distance: 7500 // km
        },
        status: 'open' as any,
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: 'alert_3',
        ruleId: 'circular_transaction_rule',
        ruleName: 'Circular Transaction Pattern',
        transactionId: 'tx_125',
        userId: 'user_101',
        severity: 'critical' as any,
        riskScore: 40,
        description: 'Suspicious circular transaction pattern detected',
        details: {
          isCircular: true,
          involvedAccounts: ['acc_1', 'acc_2', 'acc_3'],
          totalAmount: 50000,
          pattern: 'A->B->C->A'
        },
        status: 'investigating' as any,
        createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
      },
      {
        id: 'alert_4',
        ruleId: 'new_device_rule',
        ruleName: 'New Device Detection',
        transactionId: 'tx_126',
        userId: 'user_202',
        severity: 'low' as any,
        riskScore: 10,
        description: 'Transaction from unrecognized device',
        details: {
          currentDevice: 'device_new_123',
          knownDevices: ['device_main_1', 'device_mobile_1'],
          deviceType: 'desktop'
        },
        status: 'resolved' as any,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        resolvedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        resolvedBy: 'system',
        resolutionNotes: 'User verified new device via MFA'
      }
    ];

    setFraudAlerts(mockFraudAlerts);
  };

  const loadVerificationData = () => {
    // Load verification statistics
    const stats = paymentVerificationService.getVerificationStats();
    setVerificationStats(stats);

    // Load mock payment verifications
    const mockVerifications: PaymentVerification[] = [
      {
        id: 'verification_1',
        paymentId: 'payment_1',
        amount: 1500.00,
        currency: 'USD',
        customerId: 'customer_1',
        customerEmail: 'john@example.com',
        ipAddress: '192.168.1.100',
        deviceFingerprint: 'device_123',
        riskScore: 45,
        riskFactors: [
          {
            id: 'new_customer',
            name: 'New Customer',
            description: 'Customer has limited transaction history',
            severity: 'low' as any,
            category: 'identity' as any,
            score: 15,
            detected: true
          }
        ],
        workflow: {
          id: 'workflow_1',
          paymentId: 'payment_1',
          name: 'Medium Risk Verification',
          description: 'Verification workflow for medium risk payment',
          riskLevel: 'medium' as any,
          steps: [
            {
              id: 'step_1',
              name: 'Basic Validation',
              description: 'Validate payment data and format',
              type: 'risk_assessment' as any,
              status: 'completed' as any,
              required: true,
              order: 1,
              completedAt: new Date().toISOString(),
              retryCount: 0,
              maxRetries: 3
            },
            {
              id: 'step_2',
              name: 'Email Verification',
              description: 'Verify customer email address',
              type: 'email_verification' as any,
              status: 'completed' as any,
              required: true,
              order: 2,
              completedAt: new Date().toISOString(),
              retryCount: 0,
              maxRetries: 3
            }
          ],
          overallStatus: 'completed' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        decision: 'approve' as any,
        completedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      },
      {
        id: 'verification_2',
        paymentId: 'payment_2',
        amount: 25000.00,
        currency: 'USD',
        customerId: 'customer_2',
        customerEmail: 'jane@example.com',
        ipAddress: '192.168.1.101',
        deviceFingerprint: 'device_456',
        riskScore: 85,
        riskFactors: [
          {
            id: 'high_amount',
            name: 'High Transaction Amount',
            description: 'Transaction amount exceeds threshold',
            severity: 'medium' as any,
            category: 'transaction' as any,
            score: 25,
            detected: true
          },
          {
            id: 'high_risk_location',
            name: 'High Risk Location',
            description: 'Transaction from high-risk geographic location',
            severity: 'high' as any,
            category: 'location' as any,
            score: 30,
            detected: true
          }
        ],
        workflow: {
          id: 'workflow_2',
          paymentId: 'payment_2',
          name: 'High Risk Verification',
          description: 'Verification workflow for high risk payment',
          riskLevel: 'high' as any,
          steps: [
            {
              id: 'step_1',
              name: 'Basic Validation',
              description: 'Validate payment data and format',
              type: 'risk_assessment' as any,
              status: 'completed' as any,
              required: true,
              order: 1,
              completedAt: new Date().toISOString(),
              retryCount: 0,
              maxRetries: 3
            },
            {
              id: 'step_2',
              name: 'Email Verification',
              description: 'Verify customer email address',
              type: 'email_verification' as any,
              status: 'completed' as any,
              required: true,
              order: 2,
              completedAt: new Date().toISOString(),
              retryCount: 0,
              maxRetries: 3
            },
            {
              id: 'step_3',
              name: 'Identity Verification',
              description: 'Verify customer identity',
              type: 'identity_verification' as any,
              status: 'in_progress' as any,
              required: true,
              order: 3,
              retryCount: 1,
              maxRetries: 3
            }
          ],
          overallStatus: 'in_progress' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 1800000).toISOString() // 30 minutes from now
        },
        decision: 'pending' as any,
        createdAt: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      }
    ];

    setPaymentVerifications(mockVerifications);
  };

  const loadMultiCurrencyData = () => {
    // Initialize multi-currency prices with a sample amount
    const prices = currencyService.getMultiCurrencyPrices(100, 'USD');
    setMultiCurrencyPrices(prices);
  };

  const handleCurrencyConversion = () => {
    if (!converterAmount) return;
    
    const amount = parseFloat(converterAmount);
    const converted = currencyService.convertAmount(amount, converterFrom, converterTo);
    setConvertedAmount(converted);
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    // Update form data currency when currency changes
    setFormData(prev => ({ ...prev, currency }));
    setRecurringFormData(prev => ({ ...prev, currency }));
    setTaxFormData(prev => ({ ...prev, currency }));
  };

  const handleTaxCalculation = () => {
    if (!taxFormData.amount) return;

    const calculation = taxService.calculateTax({
      amount: parseFloat(taxFormData.amount),
      currency: taxFormData.currency,
      country: taxFormData.country,
      region: taxFormData.region || undefined,
      customerType: taxFormData.customerType,
      businessCategory: taxFormData.businessCategory || undefined
    });

    setTaxCalculation(calculation);
  };

  const loadRecurringPaymentsData = async () => {
    // Load subscription plans
    const plans = recurringPaymentService.getSubscriptionPlans();
    setSubscriptionPlans(plans);
    
    // Load recurring payments (mock data for demo)
    const mockRecurringPayments: RecurringPayment[] = [
      {
        id: "recurring_1",
        customerId: "customer_1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        amount: 19.99,
        currency: "USD",
        description: "Premium Monthly Subscription",
        frequency: "monthly",
        interval: 30,
        startDate: "2024-01-01T00:00:00Z",
        nextPaymentDate: "2024-02-01T00:00:00Z",
        status: "active",
        paymentMethod: "lightning",
        currentPayments: 1,
        totalCollected: 19.99,
        lastPaymentDate: "2024-01-01T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      },
      {
        id: "recurring_2",
        customerId: "customer_2",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        amount: 9.99,
        currency: "USD",
        description: "Basic Monthly Subscription",
        frequency: "monthly",
        interval: 30,
        startDate: "2024-01-15T00:00:00Z",
        nextPaymentDate: "2024-02-15T00:00:00Z",
        status: "active",
        paymentMethod: "bitcoin",
        currentPayments: 0,
        totalCollected: 0,
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z"
      }
    ];
    setRecurringPayments(mockRecurringPayments);
  };

  const handleCreateRecurringPayment = async () => {
    if (!recurringFormData.customerName || !recurringFormData.customerEmail || !recurringFormData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const paymentData = {
        customerId: `customer_${Date.now()}`,
        customerName: recurringFormData.customerName,
        customerEmail: recurringFormData.customerEmail,
        amount: parseFloat(recurringFormData.amount),
        currency: recurringFormData.currency,
        description: recurringFormData.description,
        frequency: recurringFormData.frequency,
        startDate: recurringFormData.startDate || new Date().toISOString(),
        paymentMethod: recurringFormData.paymentMethod,
        maxPayments: recurringFormData.maxPayments ? parseInt(recurringFormData.maxPayments) : undefined
      };

      const newRecurringPayment = await recurringPaymentService.createRecurringPayment(paymentData);
      setRecurringPayments([newRecurringPayment, ...recurringPayments]);
      setShowCreateRecurring(false);
      
      // Reset form
      setRecurringFormData({
        customerName: "",
        customerEmail: "",
        amount: "",
        currency: "USD",
        description: "",
        frequency: "monthly",
        paymentMethod: "lightning",
        startDate: "",
        maxPayments: ""
      });
    } catch (error) {
      alert("Failed to create recurring payment: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscriptionFromPlan = async (planId: string) => {
    if (!recurringFormData.customerName || !recurringFormData.customerEmail) {
      alert("Please fill in customer name and email");
      return;
    }

    setLoading(true);
    
    try {
      const customerData = {
        customerId: `customer_${Date.now()}`,
        customerName: recurringFormData.customerName,
        customerEmail: recurringFormData.customerEmail,
        paymentMethod: recurringFormData.paymentMethod
      };

      const newRecurringPayment = await recurringPaymentService.createSubscriptionFromPlan(planId, customerData);
      setRecurringPayments([newRecurringPayment, ...recurringPayments]);
      setShowCreateRecurring(false);
      setSelectedPlan("");
      
      // Reset form
      setRecurringFormData({
        customerName: "",
        customerEmail: "",
        amount: "",
        currency: "USD",
        description: "",
        frequency: "monthly",
        paymentMethod: "lightning",
        startDate: "",
        maxPayments: ""
      });
    } catch (error) {
      alert("Failed to create subscription: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseRecurringPayment = (id: string) => {
    const success = recurringPaymentService.pauseRecurringPayment(id);
    if (success) {
      setRecurringPayments(prev => 
        prev.map(payment => 
          payment.id === id 
            ? { ...payment, status: 'paused' as const, updatedAt: new Date().toISOString() }
            : payment
        )
      );
    }
  };

  const handleResumeRecurringPayment = (id: string) => {
    const success = recurringPaymentService.resumeRecurringPayment(id);
    if (success) {
      setRecurringPayments(prev => 
        prev.map(payment => 
          payment.id === id 
            ? { ...payment, status: 'active' as const, updatedAt: new Date().toISOString() }
            : payment
        )
      );
    }
  };

  const handleCancelRecurringPayment = (id: string) => {
    const success = recurringPaymentService.cancelRecurringPayment(id, "Cancelled by merchant");
    if (success) {
      setRecurringPayments(prev => 
        prev.map(payment => 
          payment.id === id 
            ? { ...payment, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
            : payment
        )
      );
    }
  };

  const loadPaymentData = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockPaymentRequests: PaymentRequest[] = [
        {
          id: "1",
          amount: 25.50,
          currency: "USD",
          description: "Premium Coffee Subscription",
          customerEmail: "john@example.com",
          status: "pending",
          paymentMethod: "lightning",
          createdAt: "2024-01-15T14:30:00Z",
          expiresAt: "2024-01-16T14:30:00Z"
        },
        {
          id: "2",
          amount: 45.00,
          currency: "USD",
          description: "Monthly Service Fee",
          customerEmail: "jane@example.com",
          status: "completed",
          paymentMethod: "bitcoin",
          createdAt: "2024-01-14T10:15:00Z",
          expiresAt: "2024-01-15T10:15:00Z"
        }
      ];

      const mockActiveSessions: PaymentSession[] = [
        {
          id: "session_1",
          amount: 15.99,
          currency: "USD",
          description: "Digital Product Purchase",
          status: "awaiting_payment",
          paymentMethod: "lightning",
          customerInfo: {
            name: "Alice Johnson",
            email: "alice@example.com"
          },
          createdAt: "2024-01-15T15:00:00Z",
          updatedAt: "2024-01-15T15:00:00Z"
        }
      ];

      setPaymentRequests(mockPaymentRequests);
      setActiveSessions(mockActiveSessions);
      setLoading(false);
    }, 1000);
  };

  const handleCreatePayment = async () => {
    if (!formData.amount || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newPayment: PaymentRequest = {
        id: Date.now().toString(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        customerEmail: formData.customerEmail || undefined,
        status: "pending",
        paymentMethod: formData.paymentMethod,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + parseInt(formData.expiryHours) * 60 * 60 * 1000).toISOString()
      };

      setCurrentPayment(newPayment);
      setShowQR(true);
      setPaymentRequests([newPayment, ...paymentRequests]);
      setLoading(false);

      // Reset form
      setFormData({
        amount: "",
        currency: "USD",
        description: "",
        customerEmail: "",
        paymentMethod: "lightning",
        expiryHours: "24"
      });
    }, 1500);
  };

  const handleCopyPaymentLink = (payment: PaymentRequest) => {
    const paymentLink = `${window.location.origin}/pay/${payment.id}`;
    navigator.clipboard.writeText(paymentLink);
    alert("Payment link copied to clipboard!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
      case "awaiting_payment":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "bitcoin":
        return <CreditCard className="h-4 w-4" />;
      case "lightning":
        return <Zap className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <ProtectedRoute requireMerchant={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
                  <p className="text-sm text-gray-600">Create and manage payment requests</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => window.location.href = '/merchant'}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Active Sessions Alert */}
          {activeSessions.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50 mb-6">
              <Bell className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                You have {activeSessions.length} active payment session{activeSessions.length > 1 ? 's' : ''} awaiting payment.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="create">Create Payment</TabsTrigger>
              <TabsTrigger value="requests">Payment Requests</TabsTrigger>
              <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Payments</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Create Payment Tab */}
            <TabsContent value="create" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Create Payment Request</CardTitle>
                    <CardDescription>
                      Generate a payment link or QR code for your customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        step="0.01"
                        min="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="BTC">BTC - Bitcoin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="What is this payment for?"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value as 'bitcoin' | 'lightning'})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lightning">
                              <div className="flex items-center">
                                <Zap className="h-4 w-4 mr-2" />
                                Lightning Network
                              </div>
                            </SelectItem>
                            <SelectItem value="bitcoin">
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Bitcoin On-Chain
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expires In</Label>
                        <Select value={formData.expiryHours} onValueChange={(value) => setFormData({...formData, expiryHours: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hour</SelectItem>
                            <SelectItem value="6">6 Hours</SelectItem>
                            <SelectItem value="24">24 Hours</SelectItem>
                            <SelectItem value="72">3 Days</SelectItem>
                            <SelectItem value="168">7 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreatePayment} 
                      disabled={loading || !formData.amount || !formData.description}
                      className="w-full"
                    >
                      {loading ? "Creating..." : "Create Payment Request"}
                    </Button>
                  </CardContent>
                </Card>

                {/* QR Code Display */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment QR Code</CardTitle>
                    <CardDescription>
                      Share this QR code with your customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showQR && currentPayment ? (
                      <div className="space-y-4">
                        <div className="flex justify-center p-4 bg-muted rounded-lg">
                          <div className="w-64 h-64 bg-white p-4 rounded shadow-sm">
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-gray-300 rounded">
                              <div className="text-center">
                                <QrCode className="h-12 w-12 mx-auto mb-2" />
                                <p>QR Code for {formatCurrency(currentPayment.amount)}</p>
                                <p className="text-xs mt-1">{currentPayment.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Amount:</span>
                            <span className="font-bold">{formatCurrency(currentPayment.amount)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Method:</span>
                            <div className="flex items-center space-x-2">
                              {getPaymentMethodIcon(currentPayment.paymentMethod)}
                              <span className="capitalize">{currentPayment.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Status:</span>
                            <Badge className={getStatusColor(currentPayment.status)}>
                              {currentPayment.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Expires:</span>
                            <span>{new Date(currentPayment.expiresAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1" onClick={() => handleCopyPaymentLink(currentPayment)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download QR
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center text-gray-500">
                          <QrCode className="h-12 w-12 mx-auto mb-4" />
                          <p>Create a payment request to generate QR code</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payment Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Requests</CardTitle>
                  <CardDescription>
                    Manage all your payment requests and track their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-full">
                            {getPaymentMethodIcon(request.paymentMethod)}
                          </div>
                          <div>
                            <div className="font-medium">{request.description}</div>
                            <div className="text-sm text-gray-600">
                              {request.customerEmail && `Customer: ${request.customerEmail}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              Created: {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(request.amount)}</div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <div className="flex space-x-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopyPaymentLink(request)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Active Sessions Tab */}
            <TabsContent value="sessions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Payment Sessions</CardTitle>
                  <CardDescription>
                    Monitor real-time payment sessions and customer interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-full">
                              {getPaymentMethodIcon(session.paymentMethod)}
                            </div>
                            <div>
                              <div className="font-medium">{session.description}</div>
                              <div className="text-sm text-gray-600">
                                Customer: {session.customerInfo?.name} ({session.customerInfo?.email})
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(session.amount)}</div>
                            <Badge className={getStatusColor(session.status)}>
                              {session.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        {session.status === 'awaiting_payment' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span>Waiting for payment...</span>
                              <span className="text-gray-500">
                                Started {new Date(session.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <Progress value={25} className="h-2" />
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-3 w-3 mr-2" />
                                Refresh
                              </Button>
                              <Button variant="outline" size="sm">
                                <Bell className="h-3 w-3 mr-2" />
                                Notify Customer
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recurring Payments Tab */}
            <TabsContent value="recurring" className="space-y-6">
              {/* Header with Create Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Recurring Payments</h2>
                  <p className="text-gray-600">Manage subscriptions and recurring billing</p>
                </div>
                <Button onClick={() => setShowCreateRecurring(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Recurring Payment
                </Button>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                        <p className="text-2xl font-bold">{recurringPayments.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                        <p className="text-2xl font-bold">
                          {recurringPayments.filter(p => p.status === 'active').length}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold">
                          ${recurringPayments
                            .filter(p => p.status === 'active' && p.frequency === 'monthly')
                            .reduce((sum, p) => sum + p.amount, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Upcoming Payments</p>
                        <p className="text-2xl font-bold">
                          {recurringPayments.filter(p => {
                            const nextPayment = new Date(p.nextPaymentDate);
                            const now = new Date();
                            const daysUntilPayment = (nextPayment.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                            return daysUntilPayment <= 7 && p.status === 'active';
                          }).length}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Recurring Payment Modal */}
              {showCreateRecurring && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Create Recurring Payment</CardTitle>
                        <CardDescription>Set up a new subscription or recurring payment</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowCreateRecurring(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Subscription Plans */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Or choose from subscription plans:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {subscriptionPlans.map((plan) => (
                          <Card 
                            key={plan.id} 
                            className={`cursor-pointer transition-all ${
                              selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            <CardHeader>
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
                              <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold mb-2">
                                ${plan.amount}/{plan.frequency}
                              </div>
                              <ul className="text-sm space-y-1">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-center">
                                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                              <Button 
                                className="w-full mt-4" 
                                onClick={() => handleCreateSubscriptionFromPlan(plan.id)}
                                disabled={loading || !recurringFormData.customerName || !recurringFormData.customerEmail}
                              >
                                Select Plan
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or create custom</span>
                      </div>
                    </div>

                    {/* Custom Recurring Payment Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Customer Name *</Label>
                        <Input
                          id="customerName"
                          placeholder="John Doe"
                          value={recurringFormData.customerName}
                          onChange={(e) => setRecurringFormData({...recurringFormData, customerName: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerEmail">Customer Email *</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder="john@example.com"
                          value={recurringFormData.customerEmail}
                          onChange={(e) => setRecurringFormData({...recurringFormData, customerEmail: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={recurringFormData.amount}
                          onChange={(e) => setRecurringFormData({...recurringFormData, amount: e.target.value})}
                          step="0.01"
                          min="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={recurringFormData.currency} onValueChange={(value) => setRecurringFormData({...recurringFormData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="BTC">BTC - Bitcoin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Monthly subscription"
                          value={recurringFormData.description}
                          onChange={(e) => setRecurringFormData({...recurringFormData, description: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={recurringFormData.frequency} onValueChange={(value) => setRecurringFormData({...recurringFormData, frequency: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select value={recurringFormData.paymentMethod} onValueChange={(value) => setRecurringFormData({...recurringFormData, paymentMethod: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lightning">
                              <div className="flex items-center">
                                <Zap className="h-4 w-4 mr-2" />
                                Lightning Network
                              </div>
                            </SelectItem>
                            <SelectItem value="bitcoin">
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Bitcoin On-Chain
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date (Optional)</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={recurringFormData.startDate}
                          onChange={(e) => setRecurringFormData({...recurringFormData, startDate: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxPayments">Max Payments (Optional)</Label>
                        <Input
                          id="maxPayments"
                          type="number"
                          placeholder="Unlimited"
                          value={recurringFormData.maxPayments}
                          onChange={(e) => setRecurringFormData({...recurringFormData, maxPayments: e.target.value})}
                          min="1"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleCreateRecurringPayment} 
                      disabled={loading || !recurringFormData.customerName || !recurringFormData.customerEmail || !recurringFormData.amount}
                      className="w-full"
                    >
                      {loading ? "Creating..." : "Create Recurring Payment"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Recurring Payments List */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Recurring Payments</CardTitle>
                  <CardDescription>
                    Manage all your subscriptions and recurring payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recurringPayments.map((payment) => (
                      <div key={payment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              payment.status === 'active' ? 'bg-green-100' :
                              payment.status === 'paused' ? 'bg-yellow-100' :
                              payment.status === 'cancelled' ? 'bg-red-100' : 'bg-gray-100'
                            }`}>
                              {payment.paymentMethod === 'lightning' ? 
                                <Zap className="h-5 w-5 text-yellow-600" /> :
                                <CreditCard className="h-5 w-5 text-blue-600" />
                              }
                            </div>
                            <div>
                              <div className="font-medium">{payment.description}</div>
                              <div className="text-sm text-gray-600">
                                Customer: {payment.customerName} ({payment.customerEmail})
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.frequency} • {payment.paymentMethod}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${payment.amount}</div>
                            <Badge className={
                              payment.status === 'active' ? 'bg-green-100 text-green-800' :
                              payment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Next Payment:</span>
                            <div className="font-medium">
                              {new Date(payment.nextPaymentDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Payments Made:</span>
                            <div className="font-medium">
                              {payment.currentPayments}{payment.maxPayments ? `/${payment.maxPayments}` : ''}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Collected:</span>
                            <div className="font-medium">${payment.totalCollected}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Started:</span>
                            <div className="font-medium">
                              {new Date(payment.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          {payment.status === 'active' && (
                            <Button variant="outline" size="sm" onClick={() => handlePauseRecurringPayment(payment.id)}>
                              <Pause className="h-3 w-3 mr-2" />
                              Pause
                            </Button>
                          )}
                          {payment.status === 'paused' && (
                            <Button variant="outline" size="sm" onClick={() => handleResumeRecurringPayment(payment.id)}>
                              <Play className="h-3 w-3 mr-2" />
                              Resume
                            </Button>
                          )}
                          {(payment.status === 'active' || payment.status === 'paused') && (
                            <Button variant="outline" size="sm" onClick={() => handleCancelRecurringPayment(payment.id)}>
                              <X className="h-3 w-3 mr-2" />
                              Cancel
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6">
              {/* Header with Statistics */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Payment Verification</h2>
                  <p className="text-gray-600">Monitor payment verification workflows and risk assessment</p>
                </div>
              </div>

              {/* Verification Statistics Cards */}
              {verificationStats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Verifications</p>
                          <p className="text-2xl font-bold">{verificationStats.totalVerifications}</p>
                        </div>
                        <Shield className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Approved</p>
                          <p className="text-2xl font-bold text-green-600">{verificationStats.approvedVerifications}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Rejected</p>
                          <p className="text-2xl font-bold text-red-600">{verificationStats.rejectedVerifications}</p>
                        </div>
                        <X className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pending</p>
                          <p className="text-2xl font-bold text-yellow-600">{verificationStats.pendingVerifications}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                          <p className="text-2xl font-bold">{verificationStats.averageRiskScore.toFixed(1)}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Payment Verifications List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payment Verifications</CardTitle>
                  <CardDescription>
                    Track verification status and risk assessment for payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentVerifications.map((verification) => (
                      <div key={verification.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              verification.decision === 'approve' ? 'bg-green-100' :
                              verification.decision === 'reject' ? 'bg-red-100' :
                              verification.decision === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                              {verification.decision === 'approve' ? 
                                <CheckCircle className="h-5 w-5 text-green-600" /> :
                                verification.decision === 'reject' ? 
                                <X className="h-5 w-5 text-red-600" /> :
                                <Clock className="h-5 w-5 text-yellow-600" />
                              }
                            </div>
                            <div>
                              <div className="font-medium">
                                {currencyService.formatAmount(verification.amount, verification.currency)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {verification.customerEmail} • {verification.paymentId}
                              </div>
                              <div className="text-xs text-gray-500">
                                Risk Score: {verification.riskScore}/100 • {verification.workflow.riskLevel} risk
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={
                              verification.decision === 'approve' ? 'bg-green-100 text-green-800' :
                              verification.decision === 'reject' ? 'bg-red-100 text-red-800' :
                              verification.decision === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }>
                              {verification.decision}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(verification.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Risk Factors */}
                        {verification.riskFactors.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Risk Factors:</div>
                            <div className="flex flex-wrap gap-2">
                              {verification.riskFactors.map((factor) => (
                                <Badge 
                                  key={factor.id} 
                                  variant="outline" 
                                  className={
                                    factor.severity === 'high' ? 'border-red-200 text-red-700' :
                                    factor.severity === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                    'border-blue-200 text-blue-700'
                                  }
                                >
                                  {factor.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Verification Steps Progress */}
                        <div className="mb-4">
                          <div className="text-sm font-medium mb-2">Verification Progress:</div>
                          <div className="space-y-2">
                            {verification.workflow.steps.map((step) => (
                              <div key={step.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  {step.status === 'completed' ? 
                                    <CheckCircle className="h-4 w-4 text-green-600" /> :
                                    step.status === 'in_progress' ? 
                                    <Clock className="h-4 w-4 text-yellow-600" /> :
                                    step.status === 'failed' ? 
                                    <X className="h-4 w-4 text-red-600" /> :
                                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                                  }
                                  <span>{step.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {step.type.replace('_', ' ')}
                                  </Badge>
                                  {step.status === 'failed' && step.retryCount > 0 && (
                                    <Badge variant="outline" className="text-xs text-orange-600">
                                      Retries: {step.retryCount}/{step.maxRetries}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowVerificationDetails(
                              showVerificationDetails === verification.id ? null : verification.id
                            )}
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            {showVerificationDetails === verification.id ? 'Hide Details' : 'View Details'}
                          </Button>
                          
                          {verification.decision === 'pending' && (
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-3 w-3 mr-2" />
                              Refresh
                            </Button>
                          )}
                        </div>

                        {/* Detailed Verification Information */}
                        {showVerificationDetails === verification.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Workflow Status:</span>
                                <span className="ml-2">{verification.workflow.overallStatus}</span>
                              </div>
                              <div>
                                <span className="font-medium">Created:</span>
                                <span className="ml-2">{new Date(verification.createdAt).toLocaleString()}</span>
                              </div>
                              {verification.completedAt && (
                                <div>
                                  <span className="font-medium">Completed:</span>
                                  <span className="ml-2">{new Date(verification.completedAt).toLocaleString()}</span>
                                </div>
                              )}
                              {verification.workflow.expiresAt && (
                                <div>
                                  <span className="font-medium">Expires:</span>
                                  <span className="ml-2">{new Date(verification.workflow.expiresAt).toLocaleString()}</span>
                                </div>
                              )}
                            </div>

                            {verification.ipAddress && (
                              <div className="text-sm">
                                <span className="font-medium">IP Address:</span>
                                <span className="ml-2">{verification.ipAddress}</span>
                              </div>
                            )}

                            {verification.deviceFingerprint && (
                              <div className="text-sm">
                                <span className="font-medium">Device Fingerprint:</span>
                                <span className="ml-2">{verification.deviceFingerprint}</span>
                              </div>
                            )}

                            <div className="text-sm">
                              <span className="font-medium">Workflow Description:</span>
                              <span className="ml-2">{verification.workflow.description}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fraud Detection Tab */}
            <TabsContent value="fraud" className="space-y-6">
              {/* Header with Statistics */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Fraud Detection</h2>
                  <p className="text-gray-600">Real-time fraud monitoring and alert management</p>
                </div>
              </div>

              {/* Fraud Detection Statistics Cards */}
              {fraudStats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                          <p className="text-2xl font-bold">{fraudStats.totalAlerts}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Open Alerts</p>
                          <p className="text-2xl font-bold text-red-600">{fraudStats.openAlerts}</p>
                        </div>
                        <X className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Resolved</p>
                          <p className="text-2xl font-bold text-green-600">{fraudStats.resolvedAlerts}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Open Cases</p>
                          <p className="text-2xl font-bold text-yellow-600">{fraudStats.openCases}</p>
                        </div>
                        <Shield className="h-8 w-8 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                          <p className="text-2xl font-bold">{fraudStats.averageRiskScore.toFixed(1)}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Top Rule Types */}
              {fraudStats && fraudStats.topRuleTypes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Fraud Rule Types</CardTitle>
                    <CardDescription>
                      Most frequently triggered fraud detection rules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {fraudStats.topRuleTypes.map((ruleType, index) => (
                        <div key={ruleType.type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-medium capitalize">
                                {ruleType.type.replace('_', ' ')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {ruleType.count} alert{ruleType.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{ruleType.count}</div>
                            <div className="text-xs text-gray-500">triggers</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fraud Alerts List */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Fraud Alerts</CardTitle>
                  <CardDescription>
                    Monitor and manage fraud detection alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fraudAlerts.map((alert) => (
                      <div key={alert.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-100' :
                              alert.severity === 'high' ? 'bg-orange-100' :
                              alert.severity === 'medium' ? 'bg-yellow-100' :
                              'bg-blue-100'
                            }`}>
                              {alert.severity === 'critical' ? 
                                <X className="h-5 w-5 text-red-600" /> :
                                alert.severity === 'high' ? 
                                <AlertTriangle className="h-5 w-5 text-orange-600" /> :
                                alert.severity === 'medium' ? 
                                <AlertTriangle className="h-5 w-5 text-yellow-600" /> :
                                <Shield className="h-5 w-5 text-blue-600" />
                              }
                            </div>
                            <div>
                              <div className="font-medium">{alert.ruleName}</div>
                              <div className="text-sm text-gray-600">
                                {alert.transactionId} • {alert.userId}
                              </div>
                              <div className="text-xs text-gray-500">
                                Risk Score: {alert.riskScore} • {alert.severity}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={
                              alert.status === 'open' ? 'bg-red-100 text-red-800' :
                              alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                              alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {alert.status.replace('_', ' ')}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(alert.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm font-medium mb-1">Description:</div>
                          <div className="text-sm text-gray-700">{alert.description}</div>
                        </div>

                        {/* Alert Details */}
                        {Object.keys(alert.details).length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Details:</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(alert.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-medium">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowFraudDetails(
                              showFraudDetails === alert.id ? null : alert.id
                            )}
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            {showFraudDetails === alert.id ? 'Hide Details' : 'View Details'}
                          </Button>
                          
                          {alert.status === 'open' && (
                            <>
                              <Button variant="outline" size="sm">
                                <Shield className="h-3 w-3 mr-2" />
                                Investigate
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  fraudDetectionService.resolveAlert(alert.id, 'Resolved as false positive', 'system');
                                  // Update local state
                                  setFraudAlerts(prev => 
                                    prev.map(a => 
                                      a.id === alert.id 
                                        ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString(), resolvedBy: 'system' }
                                        : a
                                    )
                                  );
                                }}
                              >
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Resolve
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Detailed Alert Information */}
                        {showFraudDetails === alert.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Alert ID:</span>
                                <span className="ml-2">{alert.id}</span>
                              </div>
                              <div>
                                <span className="font-medium">Rule ID:</span>
                                <span className="ml-2">{alert.ruleId}</span>
                              </div>
                              <div>
                                <span className="font-medium">Created:</span>
                                <span className="ml-2">{new Date(alert.createdAt).toLocaleString()}</span>
                              </div>
                              {alert.resolvedAt && (
                                <div>
                                  <span className="font-medium">Resolved:</span>
                                  <span className="ml-2">{new Date(alert.resolvedAt).toLocaleString()}</span>
                                </div>
                              )}
                              {alert.resolvedBy && (
                                <div>
                                  <span className="font-medium">Resolved By:</span>
                                  <span className="ml-2">{alert.resolvedBy}</span>
                                </div>
                              )}
                              {alert.resolutionNotes && (
                                <div className="col-span-2">
                                  <span className="font-medium">Resolution Notes:</span>
                                  <span className="ml-2">{alert.resolutionNotes}</span>
                                </div>
                              )}
                            </div>

                            <div className="text-sm">
                              <span className="font-medium">Full Details JSON:</span>
                              <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-x-auto">
                                {JSON.stringify(alert.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>
                      Configure your payment processing preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default Payment Method</Label>
                      <Select defaultValue="lightning">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lightning">Lightning Network (Recommended)</SelectItem>
                          <SelectItem value="bitcoin">Bitcoin On-Chain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Default Currency</Label>
                      <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyService.getSupportedCurrencies().map(currency => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center">
                                <span className="mr-2">{currency.flag}</span>
                                {currency.code} - {currency.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Expiry</Label>
                      <Select defaultValue="24">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Hour</SelectItem>
                          <SelectItem value="6">6 Hours</SelectItem>
                          <SelectItem value="24">24 Hours (Default)</SelectItem>
                          <SelectItem value="72">3 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Multi-Currency Settings</CardTitle>
                    <CardDescription>
                      Configure multi-currency pricing and exchange rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Auto-update Exchange Rates</Label>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked />
                        <span className="text-sm">Update every 5 minutes</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowCurrencyConverter(true)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Open Currency Converter
                    </Button>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowTaxCalculator(true)}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Open Tax Calculator
                    </Button>

                    {multiCurrencyPrices && (
                      <div className="space-y-2">
                        <Label>Current Exchange Rates (Base: USD)</Label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(multiCurrencyPrices.prices).slice(0, 6).map(([currency, price]) => (
                            <div key={currency} className="flex justify-between p-2 bg-gray-50 rounded">
                              <span>{currency}</span>
                              <span className="font-medium">{price.formatted}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Currency Converter Modal */}
              {showCurrencyConverter && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Currency Converter</CardTitle>
                        <CardDescription>Convert amounts between different currencies</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowCurrencyConverter(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="converterAmount">Amount</Label>
                        <Input
                          id="converterAmount"
                          type="number"
                          placeholder="100"
                          value={converterAmount}
                          onChange={(e) => setConverterAmount(e.target.value)}
                          step="0.01"
                          min="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="converterFrom">From</Label>
                        <Select value={converterFrom} onValueChange={setConverterFrom}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyService.getSupportedCurrencies().map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center">
                                  <span className="mr-2">{currency.flag}</span>
                                  {currency.code}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="converterTo">To</Label>
                        <Select value={converterTo} onValueChange={setConverterTo}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyService.getSupportedCurrencies().map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center">
                                  <span className="mr-2">{currency.flag}</span>
                                  {currency.code}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCurrencyConversion} 
                      disabled={!converterAmount}
                      className="w-full"
                    >
                      Convert
                    </Button>

                    {convertedAmount !== null && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold">
                          {currencyService.formatAmount(parseFloat(converterAmount), converterFrom)} = 
                          {' '}
                          {currencyService.formatAmount(convertedAmount, converterTo)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Exchange Rate: 1 {converterFrom} = {currencyService.getExchangeRate(converterFrom, converterTo)?.toFixed(6)} {converterTo}
                        </div>
                      </div>
                    )}

                    {/* Exchange Rate Trends */}
                    <div className="space-y-2">
                      <Label>Exchange Rate Trends (Last 7 Days)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded">
                          <div className="text-sm font-medium">{converterFrom}/{converterTo}</div>
                          <div className="text-xs text-gray-600">
                            {currencyService.getCurrencyStats(converterTo, converterFrom).dayChange.toFixed(2)}% (24h)
                          </div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-sm font-medium">Volatility</div>
                          <div className="text-xs text-gray-600">
                            {(currencyService.getCurrencyStats(converterTo, converterFrom).volatility * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tax Calculator Modal */}
              {showTaxCalculator && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Tax Calculator</CardTitle>
                        <CardDescription>Calculate tax for transactions in different jurisdictions</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowTaxCalculator(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxAmount">Amount *</Label>
                        <Input
                          id="taxAmount"
                          type="number"
                          placeholder="100.00"
                          value={taxFormData.amount}
                          onChange={(e) => setTaxFormData({...taxFormData, amount: e.target.value})}
                          step="0.01"
                          min="0.01"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxCurrency">Currency</Label>
                        <Select value={taxFormData.currency} onValueChange={(value) => setTaxFormData({...taxFormData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencyService.getSupportedCurrencies().map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center">
                                  <span className="mr-2">{currency.flag}</span>
                                  {currency.code}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxCountry">Country *</Label>
                        <Select value={taxFormData.country} onValueChange={(value) => setTaxFormData({...taxFormData, country: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">🇺🇸 United States</SelectItem>
                            <SelectItem value="EU">🇪🇺 European Union</SelectItem>
                            <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                            <SelectItem value="FR">🇫🇷 France</SelectItem>
                            <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                            <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                            <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taxRegion">Region/State</Label>
                        <Input
                          id="taxRegion"
                          placeholder="CA, NY, ON, etc."
                          value={taxFormData.region}
                          onChange={(e) => setTaxFormData({...taxFormData, region: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerType">Customer Type</Label>
                        <Select value={taxFormData.customerType} onValueChange={(value) => setTaxFormData({...taxFormData, customerType: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="non_profit">Non-Profit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessCategory">Business Category (Optional)</Label>
                        <Input
                          id="businessCategory"
                          placeholder="retail, services, technology, etc."
                          value={taxFormData.businessCategory}
                          onChange={(e) => setTaxFormData({...taxFormData, businessCategory: e.target.value})}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleTaxCalculation} 
                      disabled={!taxFormData.amount}
                      className="w-full"
                    >
                      Calculate Tax
                    </Button>

                    {taxCalculation && (
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold">
                            Subtotal: {currencyService.formatAmount(taxCalculation.amount, taxCalculation.currency)}
                          </div>
                          <div className="text-md font-medium text-blue-600">
                            Tax: {currencyService.formatAmount(taxCalculation.totalTax, taxCalculation.currency)}
                          </div>
                          <div className="text-xl font-bold">
                            Total: {currencyService.formatAmount(taxCalculation.totalAmount, taxCalculation.currency)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Effective Tax Rate: {taxCalculation.effectiveTaxRate.toFixed(2)}%
                          </div>
                        </div>

                        {taxCalculation.taxBreakdown.length > 0 && (
                          <div className="space-y-2">
                            <Label>Tax Breakdown:</Label>
                            <div className="space-y-2">
                              {taxCalculation.taxBreakdown.map((breakdown, index) => (
                                <div key={index} className="flex justify-between p-3 bg-gray-50 rounded">
                                  <div>
                                    <div className="font-medium">{breakdown.taxRateName}</div>
                                    <div className="text-sm text-gray-600">
                                      {breakdown.taxType} • {breakdown.rate}%
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">
                                      {currencyService.formatAmount(breakdown.taxAmount, taxCalculation.currency)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      on {currencyService.formatAmount(breakdown.taxableAmount, taxCalculation.currency)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Crypto Tax Guidance */}
                        {taxFormData.currency.includes('BTC') && (
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <AlertDescription>
                              <div className="font-medium mb-1">Cryptocurrency Tax Notice</div>
                              <div className="text-sm">
                                {taxService.getCryptoTaxGuidance(taxFormData.country).importantNotes.join(' • ')}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage security and fraud prevention
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        All payments are secured with end-to-end encryption and monitored for suspicious activity.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Fraud Detection</div>
                          <div className="text-sm text-gray-600">AI-powered fraud monitoring</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Payment Verification</div>
                          <div className="text-sm text-gray-600">Multi-step verification process</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Real-time Monitoring</div>
                          <div className="text-sm text-gray-600">Live transaction monitoring</div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}