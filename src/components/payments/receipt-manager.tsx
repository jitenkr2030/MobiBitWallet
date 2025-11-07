"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Mail, 
  MessageSquare, 
  Bell, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Copy,
  FileText,
  Receipt,
  Send,
  Settings,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";
import { receiptService, ReceiptData, CustomerNotification } from "@/lib/receipt-service";

export function ReceiptManager() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("receipts");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [notificationStats, setNotificationStats] = useState({
    pending: 0,
    sent: 0,
    failed: 0,
    total: 0
  });

  // Form state for generating test receipt
  const [testReceiptData, setTestReceiptData] = useState({
    customerName: "John Doe",
    customerEmail: "john@example.com",
    amount: "25.50",
    currency: "USD",
    description: "Premium Coffee Subscription",
    paymentMethod: "lightning" as 'bitcoin' | 'lightning' | 'other',
    merchantName: "MobBitWallet Cafe",
    merchantEmail: "cafe@mobbitwallet.com"
  });

  useEffect(() => {
    loadReceiptData();
    updateNotificationStats();
  }, []);

  const loadReceiptData = async () => {
    setLoading(true);
    
    // Simulate loading receipts
    setTimeout(() => {
      const mockReceipts: ReceiptData[] = [
        {
          id: "receipt_1",
          paymentId: "payment_1",
          transactionId: "tx_abc123",
          merchantName: "MobBitWallet Cafe",
          merchantEmail: "cafe@mobbitwallet.com",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          amount: 25.50,
          currency: "USD",
          description: "Premium Coffee Subscription",
          paymentMethod: "lightning",
          status: "completed",
          timestamp: "2024-01-15T14:30:00Z",
          tax: 2.04,
          subtotal: 23.46,
          total: 25.50,
          confirmationNumber: "CONF-12345678"
        },
        {
          id: "receipt_2",
          paymentId: "payment_2",
          transactionId: "tx_def456",
          merchantName: "MobBitWallet Cafe",
          merchantEmail: "cafe@mobbitwallet.com",
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          amount: 45.00,
          currency: "USD",
          description: "Monthly Service Fee",
          paymentMethod: "bitcoin",
          status: "completed",
          timestamp: "2024-01-14T10:15:00Z",
          tax: 3.60,
          subtotal: 41.40,
          total: 45.00,
          confirmationNumber: "CONF-87654321"
        }
      ];

      setReceipts(mockReceipts);
      setLoading(false);
    }, 1000);
  };

  const updateNotificationStats = () => {
    const stats = receiptService.getNotificationQueueStatus();
    setNotificationStats(stats);
  };

  const handleGenerateTestReceipt = async () => {
    setLoading(true);
    
    try {
      const paymentData = {
        id: `payment_${Date.now()}`,
        amount: parseFloat(testReceiptData.amount),
        currency: testReceiptData.currency,
        description: testReceiptData.description,
        paymentMethod: testReceiptData.paymentMethod,
        merchantName: testReceiptData.merchantName,
        merchantEmail: testReceiptData.merchantEmail,
        customerName: testReceiptData.customerName,
        customerEmail: testReceiptData.customerEmail,
        transactionHash: `tx_${Math.random().toString(36).substr(2, 9)}`,
        status: 'completed'
      };

      const receipt = receiptService.generateReceipt(paymentData);
      setReceipts([receipt, ...receipts]);
      setSelectedReceipt(receipt);
      
      // Send notification
      const notification = await receiptService.sendNotification(
        'receipt_generated',
        { name: testReceiptData.customerName, email: testReceiptData.customerEmail, id: '1' },
        paymentData,
        { email: true, sms: false, push: false }
      );
      
      setNotifications([notification, ...notifications]);
      updateNotificationStats();
      
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (receipt: ReceiptData) => {
    try {
      const pdfData = await receiptService.generateReceiptPDF(receipt);
      
      // Create download link
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `receipt_${receipt.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const handleSendNotification = async (receipt: ReceiptData) => {
    try {
      const notification = await receiptService.sendNotification(
        'receipt_generated',
        { name: receipt.customerName, email: receipt.customerEmail, id: '1' },
        { ...receipt, receiptId: receipt.id },
        { email: true, sms: false, push: false }
      );
      
      setNotifications([notification, ...notifications]);
      updateNotificationStats();
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'sent':
      case 'delivered':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Receipt & Notification Manager</span>
          </CardTitle>
          <CardDescription>
            Generate receipts and manage customer notifications
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receipts</p>
                <p className="text-2xl font-bold">{receipts.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notifications Sent</p>
                <p className="text-2xl font-bold text-green-600">{notificationStats.sent}</p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{notificationStats.pending}</p>
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
                <p className="text-2xl font-bold text-red-600">{notificationStats.failed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Receipts Tab */}
        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt History</CardTitle>
              <CardDescription>
                View and manage all generated receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Receipt className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{receipt.customerName}</div>
                        <div className="text-sm text-gray-600">{receipt.description}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(receipt.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(receipt.total)}</div>
                      <Badge className={getStatusColor(receipt.status)}>
                        {receipt.status}
                      </Badge>
                      <div className="flex space-x-2 mt-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(receipt)}>
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSendNotification(receipt)}>
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Receipt Preview */}
          {selectedReceipt && (
            <Card>
              <CardHeader>
                <CardTitle>Receipt Preview</CardTitle>
                <CardDescription>
                  Preview of receipt {selectedReceipt.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">{selectedReceipt.merchantName}</h2>
                    <p className="text-sm text-gray-600">Receipt #{selectedReceipt.confirmationNumber}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm"><strong>Date:</strong> {new Date(selectedReceipt.timestamp).toLocaleString()}</p>
                      <p className="text-sm"><strong>Customer:</strong> {selectedReceipt.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm"><strong>Receipt ID:</strong> {selectedReceipt.id}</p>
                      <p className="text-sm"><strong>Email:</strong> {selectedReceipt.customerEmail}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>{selectedReceipt.description}</span>
                      <span>{formatCurrency(selectedReceipt.subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Tax</span>
                      <span>{formatCurrency(selectedReceipt.tax || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(selectedReceipt.total)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Payment Method: {selectedReceipt.paymentMethod}</p>
                    <p>Status: {selectedReceipt.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Queue</CardTitle>
              <CardDescription>
                Monitor notification delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications in queue</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'email' ? 'bg-blue-100' :
                          notification.type === 'sms' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          {notification.type === 'email' ? (
                            <Mail className="h-4 w-4 text-blue-600" />
                          ) : notification.type === 'sms' ? (
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          ) : (
                            <Bell className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{notification.subject}</div>
                          <div className="text-sm text-gray-600">
                            To: {notification.recipient}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(notification.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generator Tab */}
        <TabsContent value="generator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Test Receipt</CardTitle>
                <CardDescription>
                  Create a test receipt and send notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={testReceiptData.customerName}
                    onChange={(e) => setTestReceiptData({...testReceiptData, customerName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={testReceiptData.customerEmail}
                    onChange={(e) => setTestReceiptData({...testReceiptData, customerEmail: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={testReceiptData.amount}
                    onChange={(e) => setTestReceiptData({...testReceiptData, amount: e.target.value})}
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={testReceiptData.currency} onValueChange={(value) => setTestReceiptData({...testReceiptData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={testReceiptData.description}
                    onChange={(e) => setTestReceiptData({...testReceiptData, description: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={testReceiptData.paymentMethod} onValueChange={(value) => setTestReceiptData({...testReceiptData, paymentMethod: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lightning">Lightning Network</SelectItem>
                      <SelectItem value="bitcoin">Bitcoin On-Chain</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateTestReceipt} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Generating..." : "Generate Receipt & Send Notification"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common receipt and notification operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex-col" variant="outline">
                    <Download className="h-6 w-6 mb-2" />
                    Download All
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <Mail className="h-6 w-6 mb-2" />
                    Email All
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <RefreshCw className="h-6 w-6 mb-2" />
                    Refresh Queue
                  </Button>
                  <Button className="h-20 flex-col" variant="outline">
                    <Settings className="h-6 w-6 mb-2" />
                    Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Settings</CardTitle>
              <CardDescription>
                Configure receipt generation and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-generate Receipts</div>
                    <div className="text-sm text-gray-600">Automatically generate receipts for completed payments</div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-600">Send email notifications for new receipts</div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Include Tax Information</div>
                    <div className="text-sm text-gray-600">Add tax calculations to receipts</div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  Receipt generation and notifications are configured and ready to use.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}