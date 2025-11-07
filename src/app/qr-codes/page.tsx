"use client";

import { useState } from "react";
import { QRCodeComponent } from "@/components/qr-code/qr-code-component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, CheckCircle, ArrowLeft, Smartphone, Camera, Download, Upload } from "lucide-react";

export default function QRCodesPage() {
  const [walletAddress] = useState('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');

  const handlePaymentRequest = (data: any) => {
    console.log('Payment request generated:', data);
    // In a real app, this would handle the payment request
  };

  const handleScanResult = (result: any) => {
    console.log('QR code scanned:', result);
    // In a real app, this would process the scan result
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <a href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </a>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">QR Code Payments</h1>
            <p className="text-muted-foreground">
              Generate and scan QR codes for instant cryptocurrency payments
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
          <Badge variant="default">
            <QrCode className="h-3 w-3 mr-1" />
            Multi-format
          </Badge>
        </div>
      </div>

      {/* QR Code Info Banner */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-800">
            <QrCode className="h-5 w-5" />
            <span>QR Code Payments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-purple-800">📱 Why Use QR Codes?</h4>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Instant payments without typing addresses</li>
                <li>• Reduced risk of human error</li>
                <li>• Support for multiple payment types</li>
                <li>• Easy to share and scan</li>
                <li>• Works offline for receiving payments</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-purple-800">🔧 Supported Formats</h4>
              <ul className="space-y-2 text-sm text-purple-700">
                <li>• Bitcoin Payment URIs (BIP-21)</li>
                <li>• Lightning Network Invoices (BOLT-11)</li>
                <li>• Raw Bitcoin Addresses</li>
                <li>• Website URLs and Payment Links</li>
                <li>• Universal payment requests</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Getting Started</span>
          </CardTitle>
          <CardDescription>
            Quick guide to using QR code payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">1. Generate QR Code</div>
              <p className="text-sm text-muted-foreground">
                Create a QR code for your Bitcoin address or Lightning invoice. Add amount and description for convenience.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">2. Share or Display</div>
              <p className="text-sm text-muted-foreground">
                Show the QR code to the sender or share it via messaging apps. The recipient can scan it instantly.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-lg font-bold mb-2">3. Scan to Pay</div>
              <p className="text-sm text-muted-foreground">
                Use your camera to scan QR codes and automatically fill in payment details for quick transactions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <Camera className="h-5 w-5" />
            <span>Security Best Practices</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-yellow-800">
            <p>• Always verify the payment details before scanning QR codes</p>
            <p>• Be cautious when scanning QR codes from unknown sources</p>
            <p>• Double-check the recipient address and amount</p>
            <p>• Use QR codes in well-lit environments for better scanning</p>
            <p>• Keep your wallet software updated for the latest security features</p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Component */}
      <QRCodeComponent
        walletAddress={walletAddress}
        onPaymentRequest={handlePaymentRequest}
        onScanResult={handleScanResult}
      />

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Advanced Features</span>
          </CardTitle>
          <CardDescription>
            Additional QR code capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">💳 Payment Requests</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Create dynamic payment requests</li>
                <li>• Set expiration times</li>
                <li>• Add custom metadata</li>
                <li>• Support for multiple currencies</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">📊 Batch Operations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Generate multiple QR codes</li>
                <li>• Bulk scan operations</li>
                <li>• Export QR code data</li>
                <li>• Integration with accounting software</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}