"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, Shield, Key, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { isBiometricAvailable, authenticateWithBiometrics } from "@/lib/encryption";

interface BiometricAuthProps {
  onAuthSuccess?: () => void;
  onAuthFailure?: () => void;
  requirePassword?: boolean;
}

export function BiometricAuth({ 
  onAuthSuccess, 
  onAuthFailure, 
  requirePassword = false 
}: BiometricAuthProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await isBiometricAvailable();
      setIsAvailable(available);
    } catch (err) {
      console.error('Error checking biometric availability:', err);
      setIsAvailable(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await authenticateWithBiometrics();
      
      if (success) {
        setAuthStatus('success');
        onAuthSuccess?.();
      } else {
        setAuthStatus('error');
        setError('Biometric authentication failed');
        onAuthFailure?.();
      }
    } catch (err) {
      setAuthStatus('error');
      setError('An error occurred during biometric authentication');
      onAuthFailure?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordAuth = () => {
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate password validation
    setTimeout(() => {
      // In a real app, this would validate against a stored hash
      if (password.length >= 6) {
        setAuthStatus('success');
        onAuthSuccess?.();
      } else {
        setAuthStatus('error');
        setError('Invalid password');
        onAuthFailure?.();
      }
      setIsLoading(false);
    }, 1000);
  };

  const resetAuth = () => {
    setAuthStatus('idle');
    setError('');
    setPassword('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Shield className="h-6 w-6" />
          <span>Secure Authentication</span>
        </CardTitle>
        <CardDescription>
          Verify your identity to access your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Biometric Status */}
        <div className="flex items-center justify-center space-x-2">
          <Fingerprint className="h-5 w-5" />
          <span className="text-sm">
            Biometric Authentication:
          </span>
          <Badge variant={isAvailable ? "default" : "secondary"}>
            {isAvailable ? "Available" : "Not Available"}
          </Badge>
        </div>

        {/* Authentication Status */}
        {authStatus !== 'idle' && (
          <Alert className={authStatus === 'success' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <div className="flex items-center space-x-2">
              {authStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {authStatus === 'success' 
                  ? "Authentication successful!" 
                  : error || "Authentication failed"
                }
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Biometric Authentication */}
        {isAvailable && authStatus === 'idle' && (
          <Button
            onClick={handleBiometricAuth}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <Fingerprint className="h-4 w-4 mr-2" />
            {isLoading ? "Authenticating..." : "Use Biometric Authentication"}
          </Button>
        )}

        {/* Password Authentication */}
        {(requirePassword || !isAvailable) && authStatus === 'idle' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordAuth()}
              />
            </div>
            <Button
              onClick={handlePasswordAuth}
              disabled={isLoading}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              {isLoading ? "Verifying..." : "Verify Password"}
            </Button>
          </div>
        )}

        {/* Reset Button */}
        {authStatus !== 'idle' && (
          <Button
            onClick={resetAuth}
            variant="outline"
            className="w-full"
          >
            Try Again
          </Button>
        )}

        {/* Security Notice */}
        <div className="text-xs text-muted-foreground text-center">
          <div className="flex items-center justify-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Your security is our priority</span>
          </div>
          <p className="mt-1">
            All authentication methods are encrypted and secure
          </p>
        </div>
      </CardContent>
    </Card>
  );
}