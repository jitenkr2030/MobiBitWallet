"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Bell,
  Shield,
  Zap,
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Copy,
  Download
} from "lucide-react";
import { paymentConfirmationService, PaymentConfirmation, PaymentNotification } from "@/lib/payment-confirmation";

interface RealTimePaymentMonitorProps {
  paymentId?: string;
  autoStart?: boolean;
}

export function RealTimePaymentMonitor({ paymentId, autoStart = false }: RealTimePaymentMonitorProps) {
  const [connected, setConnected] = useState(false);
  const [activePayments, setActivePayments] = useState<PaymentConfirmation[]>([]);
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    completedPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    averageConfirmationTime: 0
  });

  useEffect(() => {
    initializeService();
    return () => {
      paymentConfirmationService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (paymentId && autoStart && connected) {
      startMonitoring(paymentId);
    }
  }, [paymentId, autoStart, connected]);

  const initializeService = async () => {
    try {
      await paymentConfirmationService.connect();
      setConnected(true);
      
      // Register event listeners
      paymentConfirmationService.on('payment_monitoring_started', handlePaymentMonitoringStarted);
      paymentConfirmationService.on('payment_processing', handlePaymentProcessing);
      paymentConfirmationService.on('payment_confirmations_updated', handlePaymentConfirmationsUpdated);
      paymentConfirmationService.on('payment_completed', handlePaymentCompleted);
      paymentConfirmationService.on('payment_failed', handlePaymentFailed);
      paymentConfirmationService.on('payment_notification', handlePaymentNotification);
      paymentConfirmationService.on('payment_verified', handlePaymentVerified);
      
      // Update stats periodically
      const statsInterval = setInterval(updateStats, 5000);
      
      return () => {
        clearInterval(statsInterval);
        paymentConfirmationService.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize payment confirmation service:', error);
    }
  };

  const startMonitoring = async (pid: string) => {
    const paymentDetails = {
      amount: 25.50,
      currency: "USD",
      paymentMethod: "lightning",
      customerEmail: "customer@example.com"
    };
    
    await paymentConfirmationService.startPaymentMonitoring(pid, paymentDetails);
  };

  const stopMonitoring = (pid: string) => {
    paymentConfirmationService.stopPaymentMonitoring(pid);
  };

  const updateStats = () => {
    const newStats = paymentConfirmationService.getPaymentStats();
    setStats(newStats);
    setActivePayments(paymentConfirmationService.getActivePaymentConfirmations());
  };

  // Event handlers
  const handlePaymentMonitoringStarted = (data: any) => {
    console.log('Payment monitoring started:', data);
    updateStats();
  };

  const handlePaymentProcessing = (data: any) => {
    console.log('Payment processing:', data);
    updateStats();
  };

  const handlePaymentConfirmationsUpdated = (data: any) => {
    console.log('Payment confirmations updated:', data);
    updateStats();
  };

  const handlePaymentCompleted = (data: any) => {
    console.log('Payment completed:', data);
    updateStats();
    
    // Show success notification
    const notification: PaymentNotification = {
      id: `notif_${Date.now()}`,
      type: 'payment_completed',
      message: `Payment of ${data.confirmation.amount} ${data.confirmation.currency} completed successfully!`,
      paymentId: data.paymentId,
      timestamp: new Date().toISOString(),
      data: { confirmation: data.confirmation }
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  const handlePaymentFailed = (data: any) => {
    console.log('Payment failed:', data);
    updateStats();
    
    // Show failure notification
    const notification: PaymentNotification = {
      id: `notif_${Date.now()}`,
      type: 'payment_failed',
      message: `Payment failed: ${data.confirmation.errorMessage}`,
      paymentId: data.paymentId,
      timestamp: new Date().toISOString(),
      data: { confirmation: data.confirmation }
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  const handlePaymentNotification = (data: any) => {
    console.log('Payment notification:', data);
    setNotifications(prev => [data.notification, ...prev.slice(0, 9)]);
  };

  const handlePaymentVerified = (data: any) => {
    console.log('Payment verified:', data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'processing':
        return "bg-blue-100 text-blue-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConfirmationProgress = (confirmation: PaymentConfirmation) => {
    return (confirmation.confirmations / confirmation.requiredConfirmations) * 100;
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Real-time Payment Confirmation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-600' : 'bg-red-600'}`} />
              <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </CardTitle>
          <CardDescription>
            Monitor payments in real-time with instant confirmations and notifications
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{stats.totalPayments}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedPayments}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedPayments}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Active Payments Tab */}
        <TabsContent value="active" className="space-y-4">
          {activePayments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No active payments being monitored</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start monitoring a payment to see real-time confirmations
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activePayments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(payment.status)}
                        <div>
                          <div className="font-medium">
                            {formatCurrency(payment.amount)} {payment.currency}
                          </div>
                          <div className="text-sm text-gray-600">
                            {payment.customerEmail && `Customer: ${payment.customerEmail}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {payment.confirmations}/{payment.requiredConfirmations} confirmations
                        </div>
                      </div>
                    </div>

                    {payment.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Confirmations Progress</span>
                          <span>{Math.round(getConfirmationProgress(payment))}%</span>
                        </div>
                        <Progress value={getConfirmationProgress(payment)} className="h-2" />
                      </div>
                    )}

                    {payment.status === 'completed' && payment.transactionHash && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          Payment completed successfully! Transaction hash: {payment.transactionHash}
                        </AlertDescription>
                      </Alert>
                    )}

                    {payment.status === 'failed' && payment.errorMessage && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription>
                          Payment failed: {payment.errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex space-x-2 mt-4">
                      {payment.status !== 'completed' && payment.status !== 'failed' && (
                        <Button variant="outline" size="sm" onClick={() => stopMonitoring(payment.paymentRequestId)}>
                          Stop Monitoring
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {payment.status === 'completed' && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Payment notifications will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'payment_completed' ? 'bg-green-100' :
                        notification.type === 'payment_failed' ? 'bg-red-100' :
                        'bg-blue-100'
                      }`}>
                        {notification.type === 'payment_completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : notification.type === 'payment_failed' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Bell className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{notification.message}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Confirmation Settings</CardTitle>
              <CardDescription>
                Configure real-time payment monitoring preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  Real-time payment monitoring is active. All payments are automatically tracked and confirmed.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-start Monitoring</div>
                    <div className="text-sm text-gray-600">Automatically start monitoring new payments</div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-600">Send email notifications for payment events</div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sound Alerts</div>
                    <div className="text-sm text-gray-600">Play sound for payment completions</div>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}