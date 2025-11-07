"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Send, 
  Download, 
  QrCode, 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Cable,
  TrendingUp,
  Clock,
  DollarSign,
  Settings
} from "lucide-react";
import { lightningService, LightningInvoice, LightningPayment, LightningChannel } from "@/lib/lightning";

interface LightningComponentProps {
  walletBalance?: number;
  onTransactionComplete?: (transaction: any) => void;
}

export function LightningComponent({ walletBalance = 0, onTransactionComplete }: LightningComponentProps) {
  const [invoice, setInvoice] = useState<LightningInvoice | null>(null);
  const [receiveAmount, setReceiveAmount] = useState("");
  const [receiveDescription, setReceiveDescription] = useState("");
  const [sendInvoice, setSendInvoice] = useState("");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isPayingInvoice, setIsPayingInvoice] = useState(false);
  const [channels, setChannels] = useState<LightningChannel[]>([]);
  const [nodeInfo, setNodeInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("receive");
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [decodedInvoice, setDecodedInvoice] = useState<any>(null);

  useEffect(() => {
    loadLightningData();
  }, []);

  const loadLightningData = async () => {
    setIsLoading(true);
    try {
      const [channelsData, nodeInfoData] = await Promise.all([
        lightningService.getChannels(),
        lightningService.getNodeInfo()
      ]);
      setChannels(channelsData);
      setNodeInfo(nodeInfoData);
    } catch (error) {
      console.error('Error loading Lightning data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!receiveAmount || parseFloat(receiveAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const amount = parseFloat(receiveAmount);
      const newInvoice = await lightningService.createInvoice(
        amount,
        receiveDescription || 'MobBitWallet payment'
      );
      setInvoice(newInvoice);
      setShowQR(true);
      setReceiveAmount("");
      setReceiveDescription("");
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create Lightning invoice');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handlePayInvoice = async () => {
    if (!sendInvoice.trim()) {
      alert('Please enter a Lightning invoice');
      return;
    }

    setIsPayingInvoice(true);
    setPaymentStatus('processing');
    try {
      // First decode the invoice to show details
      const decoded = await lightningService.decodeInvoice(sendInvoice);
      setDecodedInvoice(decoded);

      // Then pay the invoice
      const payment = await lightningService.payInvoice(sendInvoice);
      setPaymentStatus('success');
      
      // Notify parent component
      onTransactionComplete?.({
        type: 'sent',
        amount: lightningService.msatsToBtc(payment.amount_msat),
        currency: 'BTC',
        fee: lightningService.msatsToBtc(payment.fee_msat),
        description: 'Lightning payment',
        status: 'confirmed',
        timestamp: new Date().toISOString()
      });

      // Reset form
      setSendInvoice("");
      setDecodedInvoice(null);
    } catch (error) {
      console.error('Error paying invoice:', error);
      setPaymentStatus('error');
    } finally {
      setIsPayingInvoice(false);
    }
  };

  const handleCopyInvoice = () => {
    if (invoice?.payment_request) {
      navigator.clipboard.writeText(invoice.payment_request);
      alert('Invoice copied to clipboard!');
    }
  };

  const handleCopyPaymentRequest = () => {
    if (sendInvoice) {
      navigator.clipboard.writeText(sendInvoice);
      alert('Invoice copied to clipboard!');
    }
  };

  const formatBalance = (sats: number) => {
    return `${lightningService.satsToBtc(sats).toFixed(8)} BTC`;
  };

  const totalCapacity = channels.reduce((sum, channel) => sum + channel.capacity_sat, 0);
  const totalLocalBalance = channels.reduce((sum, channel) => sum + channel.local_balance_sat, 0);
  const activeChannels = channels.filter(c => c.state === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Lightning Network</h2>
        </div>
        <Button variant="outline" onClick={loadLightningData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Lightning Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Node Status</p>
                <p className="text-lg font-bold text-green-600">Online</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Channels</p>
                <p className="text-lg font-bold">{activeChannels}</p>
              </div>
              <Cable className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-lg font-bold">{formatBalance(totalCapacity)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Local Balance</p>
                <p className="text-lg font-bold">{formatBalance(totalLocalBalance)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Lightning Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Lightning Payments</span>
          </CardTitle>
          <CardDescription>
            Send and receive instant Bitcoin payments via Lightning Network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="receive" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Receive</span>
              </TabsTrigger>
              <TabsTrigger value="send" className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Send</span>
              </TabsTrigger>
            </TabsList>

            {/* Receive Tab */}
            <TabsContent value="receive" className="space-y-4">
              {!invoice ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="receive-amount">Amount (BTC)</Label>
                      <Input
                        id="receive-amount"
                        type="number"
                        placeholder="0.00000001"
                        value={receiveAmount}
                        onChange={(e) => setReceiveAmount(e.target.value)}
                        step="0.00000001"
                        min="0.00000001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receive-description">Description (Optional)</Label>
                      <Input
                        id="receive-description"
                        placeholder="Payment description"
                        value={receiveDescription}
                        onChange={(e) => setReceiveDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateInvoice} 
                    disabled={isCreatingInvoice || !receiveAmount}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isCreatingInvoice ? 'Creating Invoice...' : 'Create Lightning Invoice'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Lightning Invoice Created</h4>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCopyInvoice}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setInvoice(null)}>
                        New Invoice
                      </Button>
                    </div>
                  </div>

                  {showQR && (
                    <div className="flex justify-center p-4 bg-muted rounded-lg">
                      <div className="w-64 h-64 bg-white p-4 rounded">
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          QR Code would be generated here
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Invoice Details</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="ml-2 font-medium">
                          {lightningService.msatsToBtc(invoice.amount_msat).toFixed(8)} BTC
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="ml-2 font-medium">
                          {new Date((invoice.timestamp + invoice.expiry) * 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Request</Label>
                    <Textarea
                      value={invoice.payment_request}
                      readOnly
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      Share this invoice with the sender. They can scan the QR code or copy the payment request.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>

            {/* Send Tab */}
            <TabsContent value="send" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="send-invoice">Lightning Invoice</Label>
                  <Textarea
                    id="send-invoice"
                    placeholder="lnbc1..."
                    value={sendInvoice}
                    onChange={(e) => setSendInvoice(e.target.value)}
                    rows={3}
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyPaymentRequest}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invoice
                  </Button>
                </div>

                {decodedInvoice && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h5 className="font-medium mb-2">Invoice Details</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="ml-2 font-medium">
                          {lightningService.msatsToBtc(decodedInvoice.amount_msat || 0).toFixed(8)} BTC
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Description:</span>
                        <span className="ml-2 font-medium">{decodedInvoice.description || 'No description'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handlePayInvoice} 
                  disabled={isPayingInvoice || !sendInvoice.trim()}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isPayingInvoice ? 'Processing Payment...' : 'Pay Lightning Invoice'}
                </Button>

                {paymentStatus === 'processing' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing payment...</span>
                    </div>
                    <Progress value={66} />
                  </div>
                )}

                {paymentStatus === 'success' && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Payment sent successfully! The transaction has been completed via Lightning Network.
                    </AlertDescription>
                  </Alert>
                )}

                {paymentStatus === 'error' && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      Payment failed. Please check the invoice and try again.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lightning Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cable className="h-5 w-5" />
            <span>Lightning Channels</span>
          </CardTitle>
          <CardDescription>
            Manage your Lightning Network channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Cable className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Lightning channels found</p>
              <p className="text-sm">Open a channel to start using Lightning Network</p>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      channel.state === 'active' ? 'bg-green-100' : 
                      channel.state === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <Cable className={`h-5 w-5 ${
                        channel.state === 'active' ? 'text-green-600' : 
                        channel.state === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium">{channel.id}</div>
                      <div className="text-sm text-muted-foreground">
                        Peer: {channel.peer_id.slice(0, 10)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Capacity: {formatBalance(channel.capacity_sat)} | 
                        Local: {formatBalance(channel.local_balance_sat)} | 
                        Remote: {formatBalance(channel.remote_balance_sat)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      channel.state === 'active' ? 'bg-green-100 text-green-800' : 
                      channel.state === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }>
                      {channel.state}
                    </Badge>
                    {channel.private && (
                      <Badge variant="secondary">Private</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightning Info */}
      {nodeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Node Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Alias:</span>
                <span className="ml-2 font-medium">{nodeInfo.alias}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pubkey:</span>
                <span className="ml-2 font-mono">{nodeInfo.pubkey.slice(0, 20)}...</span>
              </div>
              <div>
                <span className="text-muted-foreground">Color:</span>
                <span className="ml-2 font-medium">{nodeInfo.color}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Addresses:</span>
                <span className="ml-2 font-medium">{nodeInfo.addresses.length} available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}