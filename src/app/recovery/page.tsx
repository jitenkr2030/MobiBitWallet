"use client";

import { useState } from "react";
import { MnemonicManagement } from "@/components/auth/mnemonic-management";
import { BiometricAuth } from "@/components/auth/biometric-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Shield, CheckCircle, ArrowLeft } from "lucide-react";

export default function RecoveryPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>('');

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleAuthFailure = () => {
    setIsAuthenticated(false);
  };

  const handleMnemonicGenerated = (newMnemonic: string) => {
    setMnemonic(newMnemonic);
  };

  const handleMnemonicImported = (importedMnemonic: string) => {
    setMnemonic(importedMnemonic);
  };

  const handleMnemonicBackedUp = () => {
    // Handle backup completion
    console.log('Mnemonic backed up successfully');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Recovery Phrase</h1>
            <p className="text-muted-foreground">
              Please authenticate to access your recovery phrase management
            </p>
          </div>
          <BiometricAuth 
            onAuthSuccess={handleAuthSuccess}
            onAuthFailure={handleAuthFailure}
            requirePassword={true}
          />
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">Recovery Phrase Management</h1>
            <p className="text-muted-foreground">
              Securely manage your wallet recovery phrase
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Authenticated
          </Badge>
          {mnemonic && (
            <Badge variant="default">
              <Key className="h-3 w-3 mr-1" />
              Phrase Set
            </Badge>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <Shield className="h-5 w-5" />
            <span>Security Notice</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-yellow-800">
            <p>• Your recovery phrase is the <strong>only way</strong> to restore your wallet if you lose access</p>
            <p>• Never share your recovery phrase with anyone</p>
            <p>• Store it in multiple secure, offline locations</p>
            <p>• Anyone with access to this phrase can control your funds</p>
            <p>• MobBitWallet team will <strong>never</strong> ask for your recovery phrase</p>
          </div>
        </CardContent>
      </Card>

      {/* Mnemonic Management Component */}
      <MnemonicManagement
        onMnemonicGenerated={handleMnemonicGenerated}
        onMnemonicImported={handleMnemonicImported}
        onMnemonicBackedUp={handleMnemonicBackedUp}
      />

      {/* Additional Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices for Recovery Phrase Security</CardTitle>
          <CardDescription>
            Follow these recommendations to keep your recovery phrase safe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Do</h4>
              <ul className="space-y-2 text-sm">
                <li>• Write it down on paper and store in multiple secure locations</li>
                <li>• Use a fireproof safe or safety deposit box</li>
                <li>• Consider using a metal backup plate for long-term storage</li>
                <li>• Share with trusted family members (split the phrase)</li>
                <li>• Test your backup by restoring a test wallet</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">❌ Don't</h4>
              <ul className="space-y-2 text-sm">
                <li>• Store it digitally (photos, screenshots, cloud storage)</li>
                <li>• Share it with anyone you don't trust completely</li>
                <li>• Enter it on websites or applications you don't trust</li>
                <li>• Store it in email or messaging apps</li>
                <li>• Forget where you stored it</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}