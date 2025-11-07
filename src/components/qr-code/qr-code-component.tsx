"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  QrCode, 
  Camera, 
  Copy, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Smartphone,
  Monitor,
  Bitcoin,
  Zap,
  Link,
  FileText
} from "lucide-react";
import { qrCodeService, QRCodeData, ScanResult } from "@/lib/qr-code";

interface QRCodeComponentProps {
  onPaymentRequest?: (data: QRCodeData) => void;
  onScanResult?: (result: ScanResult) => void;
  walletAddress?: string;
}

export function QRCodeComponent({ onPaymentRequest, onScanResult, walletAddress = '' }: QRCodeComponentProps) {
  const [activeTab, setActiveTab] = useState("generate");
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate form state
  const [qrType, setQrType] = useState<'bitcoin' | 'lightning' | 'address' | 'url'>('bitcoin');
  const [qrAddress, setQrAddress] = useState(walletAddress);
  const [qrAmount, setQrAmount] = useState("");
  const [qrLabel, setQrLabel] = useState("");
  const [qrMessage, setQrMessage] = useState("");
  const [qrInvoice, setQrInvoice] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (walletAddress) {
      setQrAddress(walletAddress);
    }
  }, [walletAddress]);

  const handleGenerateQR = async () => {
    setIsGenerating(true);
    try {
      let data: QRCodeData;

      switch (qrType) {
        case 'bitcoin':
          if (!qrAddress) {
            alert('Please enter a Bitcoin address');
            return;
          }
          const amount = qrAmount ? parseFloat(qrAmount) : undefined;
          data = qrCodeService.generateBitcoinQR(qrAddress, amount, qrLabel, qrMessage);
          break;
        
        case 'lightning':
          if (!qrInvoice) {
            alert('Please enter a Lightning invoice');
            return;
          }
          data = qrCodeService.generateLightningQR(qrInvoice, qrLabel);
          break;
        
        case 'address':
          if (!qrAddress) {
            alert('Please enter an address');
            return;
          }
          data = qrCodeService.generateAddressQR(qrAddress, qrLabel);
          break;
        
        case 'url':
          if (!qrUrl) {
            alert('Please enter a URL');
            return;
          }
          data = qrCodeService.generateUrlQR(qrUrl, qrLabel);
          break;
        
        default:
          return;
      }

      setQrData(data);
      
      // Generate QR code image
      const imageUrl = await qrCodeService.generateQRCodeDataURL(data.data);
      setQrImageUrl(imageUrl);
      
      onPaymentRequest?.(data);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScanQR = async () => {
    setIsScanning(true);
    setScanResult(null);
    
    try {
      // Simulate QR code scanning
      const result = await qrCodeService.simulateQRScan();
      setScanResult(result);
      onScanResult?.(result);
    } catch (error) {
      console.error('Error scanning QR code:', error);
      alert('Failed to scan QR code');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imageData = e.target?.result as string;
        // In a real implementation, you would use a QR code scanning library
        // For now, we'll simulate a successful scan
        const mockResult: ScanResult = {
          data: 'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=0.001',
          type: 'bitcoin',
          isValid: true,
          parsedData: {
            address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            amount: 0.001,
            type: 'bitcoin'
          }
        };
        setScanResult(mockResult);
        onScanResult?.(mockResult);
      } catch (error) {
        console.error('Error processing QR code image:', error);
        alert('Failed to process QR code image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyQRData = () => {
    if (qrData?.data) {
      navigator.clipboard.writeText(qrData.data);
      alert('QR code data copied to clipboard!');
    }
  };

  const handleDownloadQR = () => {
    if (qrImageUrl) {
      const link = document.createElement('a');
      link.href = qrImageUrl;
      link.download = `qrcode-${qrData?.type}-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'bitcoin':
        return <Bitcoin className="h-4 w-4" />;
      case 'lightning':
        return <Zap className="h-4 w-4" />;
      case 'address':
        return <Monitor className="h-4 w-4" />;
      case 'url':
        return <Link className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getQRTypeColor = (type: string) => {
    switch (type) {
      case 'bitcoin':
        return 'bg-orange-100 text-orange-800';
      case 'lightning':
        return 'bg-yellow-100 text-yellow-800';
      case 'address':
        return 'bg-blue-100 text-blue-800';
      case 'url':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <QrCode className="h-6 w-6" />
          <h2 className="text-2xl font-bold">QR Code Payments</h2>
        </div>
      </div>

      {/* Main QR Code Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>QR Code Generator & Scanner</span>
          </CardTitle>
          <CardDescription>
            Create and scan QR codes for instant payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>Generate</span>
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Scan</span>
              </TabsTrigger>
            </TabsList>

            {/* Generate Tab */}
            <TabsContent value="generate" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>QR Code Type</Label>
                    <Select value={qrType} onValueChange={(value: any) => setQrType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bitcoin">Bitcoin Payment</SelectItem>
                        <SelectItem value="lightning">Lightning Invoice</SelectItem>
                        <SelectItem value="address">Wallet Address</SelectItem>
                        <SelectItem value="url">Website URL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(qrType === 'bitcoin' || qrType === 'address') && (
                    <div className="space-y-2">
                      <Label htmlFor="qr-address">Bitcoin Address</Label>
                      <Input
                        id="qr-address"
                        placeholder="bc1q..."
                        value={qrAddress}
                        onChange={(e) => setQrAddress(e.target.value)}
                      />
                    </div>
                  )}

                  {qrType === 'lightning' && (
                    <div className="space-y-2">
                      <Label htmlFor="qr-invoice">Lightning Invoice</Label>
                      <Textarea
                        id="qr-invoice"
                        placeholder="lnbc1..."
                        value={qrInvoice}
                        onChange={(e) => setQrInvoice(e.target.value)}
                        rows={3}
                      />
                    </div>
                  )}

                  {qrType === 'url' && (
                    <div className="space-y-2">
                      <Label htmlFor="qr-url">URL</Label>
                      <Input
                        id="qr-url"
                        placeholder="https://..."
                        value={qrUrl}
                        onChange={(e) => setQrUrl(e.target.value)}
                      />
                    </div>
                  )}

                  {(qrType === 'bitcoin') && (
                    <div className="space-y-2">
                      <Label htmlFor="qr-amount">Amount (BTC) - Optional</Label>
                      <Input
                        id="qr-amount"
                        type="number"
                        placeholder="0.00000001"
                        value={qrAmount}
                        onChange={(e) => setQrAmount(e.target.value)}
                        step="0.00000001"
                        min="0"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="qr-label">Label - Optional</Label>
                    <Input
                      id="qr-label"
                      placeholder="Payment description"
                      value={qrLabel}
                      onChange={(e) => setQrLabel(e.target.value)}
                    />
                  </div>

                  {qrType === 'bitcoin' && (
                    <div className="space-y-2">
                      <Label htmlFor="qr-message">Message - Optional</Label>
                      <Input
                        id="qr-message"
                        placeholder="Payment message"
                        value={qrMessage}
                        onChange={(e) => setQrMessage(e.target.value)}
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleGenerateQR} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                </div>

                {/* QR Code Display */}
                <div className="space-y-4">
                  {qrData && qrImageUrl ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Generated QR Code</h4>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={handleCopyQRData}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-center p-4 bg-muted rounded-lg">
                        <div className="w-64 h-64 bg-white p-4 rounded shadow-sm">
                          <img 
                            src={qrImageUrl} 
                            alt="Generated QR Code" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getQRTypeIcon(qrData.type)}
                          <Badge className={getQRTypeColor(qrData.type)}>
                            {qrData.type.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="text-sm">
                          <Label>QR Code Data:</Label>
                          <div className="mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                            {qrData.data}
                          </div>
                        </div>

                        {qrData.amount && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-2 font-medium">{qrData.amount} BTC</span>
                          </div>
                        )}

                        {qrData.label && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Label:</span>
                            <span className="ml-2 font-medium">{qrData.label}</span>
                          </div>
                        )}

                        {qrData.message && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Message:</span>
                            <span className="ml-2 font-medium">{qrData.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Generate a QR code to see it here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Scan Tab */}
            <TabsContent value="scan" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scan Options */}
                <div className="space-y-4">
                  <div className="space-y-4">
                    <Button 
                      onClick={handleScanQR} 
                      disabled={isScanning}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isScanning ? 'Scanning...' : 'Start Camera Scan'}
                    </Button>

                    <div className="text-center">
                      <span className="text-muted-foreground">or</span>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload QR Code Image
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {isScanning && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Scanning for QR codes...</span>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-32 h-32 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                    </div>
                  )}

                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      Point your camera at a QR code or upload an image containing a QR code. 
                      Supported formats: Bitcoin payments, Lightning invoices, wallet addresses, and URLs.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Scan Results */}
                <div className="space-y-4">
                  {scanResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Scan Result</h4>
                        <Badge className={scanResult.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {scanResult.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="ml-2 font-medium capitalize">{scanResult.type}</span>
                        </div>

                        <div className="text-sm">
                          <span className="text-muted-foreground">Data:</span>
                          <div className="mt-1 p-2 bg-muted rounded font-mono text-xs break-all">
                            {scanResult.data}
                          </div>
                        </div>

                        {scanResult.parsedData && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Parsed Information:</h5>
                            <div className="text-xs space-y-1">
                              {Object.entries(scanResult.parsedData).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground capitalize">{key}:</span>
                                  <span className="font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {scanResult.isValid && (
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => navigator.clipboard.writeText(scanResult.data)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                // Handle the scanned data (e.g., initiate payment)
                                console.log('Processing scanned data:', scanResult);
                              }}
                            >
                              Process
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Scan a QR code to see results here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common QR code operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => {
              setQrType('bitcoin');
              setActiveTab('generate');
            }}>
              <Bitcoin className="h-6 w-6 mb-2" />
              Bitcoin Payment
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => {
              setQrType('lightning');
              setActiveTab('generate');
            }}>
              <Zap className="h-6 w-6 mb-2" />
              Lightning Invoice
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab('scan')}>
              <Camera className="h-6 w-6 mb-2" />
              Scan QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}