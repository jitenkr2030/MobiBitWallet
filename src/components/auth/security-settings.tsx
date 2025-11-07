"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Fingerprint, 
  Key, 
  Download, 
  Upload, 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { encrypt, decrypt, generateMnemonic, generateSecureRandom } from "@/lib/encryption";

interface SecuritySettingsProps {
  userId?: string;
}

export function SecuritySettings({ userId }: SecuritySettingsProps) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState(5);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [backupStatus, setBackupStatus] = useState<'none' | 'local' | 'cloud'>('none');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const handleGenerateMnemonic = async () => {
    setIsGeneratingMnemonic(true);
    try {
      const newMnemonic = generateMnemonic(256); // 24 words
      setMnemonic(newMnemonic);
      setShowMnemonic(true);
      setMessage({ type: 'success', text: 'New recovery phrase generated. Store it securely!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate recovery phrase' });
    } finally {
      setIsGeneratingMnemonic(false);
    }
  };

  const handleCopyMnemonic = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      setMessage({ type: 'success', text: 'Recovery phrase copied to clipboard' });
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBackupStatus('local');
      setMessage({ type: 'success', text: 'Backup created successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create backup' });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    // Simulate password change
    setMessage({ type: 'success', text: 'Password changed successfully' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggleBiometric = (enabled: boolean) => {
    setBiometricEnabled(enabled);
    if (enabled) {
      setMessage({ type: 'success', text: 'Biometric authentication enabled' });
    } else {
      setMessage({ type: 'warning', text: 'Biometric authentication disabled' });
    }
  };

  const handleToggleTwoFactor = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    if (enabled) {
      setMessage({ type: 'success', text: 'Two-factor authentication enabled' });
    } else {
      setMessage({ type: 'warning', text: 'Two-factor authentication disabled' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Security Settings</h2>
      </div>

      {/* Messages */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 
                           message.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : 
                           'border-red-200 bg-red-50'}>
          <AlertTriangle className={`h-4 w-4 ${
            message.type === 'success' ? 'text-green-600' : 
            message.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
          }`} />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Authentication Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fingerprint className="h-5 w-5" />
            <span>Authentication Methods</span>
          </CardTitle>
          <CardDescription>
            Configure how you want to secure your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Biometric Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Use fingerprint or face recognition
              </p>
            </div>
            <Switch
              checked={biometricEnabled}
              onCheckedChange={handleToggleBiometric}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleToggleTwoFactor}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Lock</Label>
              <p className="text-sm text-muted-foreground">
                Automatically lock wallet after inactivity
              </p>
            </div>
            <Switch
              checked={autoLockEnabled}
              onCheckedChange={setAutoLockEnabled}
            />
          </div>

          {autoLockEnabled && (
            <div className="space-y-2">
              <Label>Auto-Lock Time (minutes)</Label>
              <Input
                type="number"
                value={autoLockTime}
                onChange={(e) => setAutoLockTime(parseInt(e.target.value) || 5)}
                min={1}
                max={60}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recovery Phrase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Recovery Phrase</span>
          </CardTitle>
          <CardDescription>
            Your 24-word recovery phrase is the only way to restore your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mnemonic ? (
            <Button
              onClick={handleGenerateMnemonic}
              disabled={isGeneratingMnemonic}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              {isGeneratingMnemonic ? 'Generating...' : 'Generate Recovery Phrase'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Your Recovery Phrase</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMnemonic(!showMnemonic)}
                  >
                    {showMnemonic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyMnemonic}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {showMnemonic && (
                <div className="grid grid-cols-3 gap-2 p-4 bg-muted rounded-lg">
                  {mnemonic.split(' ').map((word, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-muted-foreground">{index + 1}.</span> {word}
                    </div>
                  ))}
                </div>
              )}

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  Never share your recovery phrase with anyone. Store it in a secure location.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Backup & Restore</span>
          </CardTitle>
          <CardDescription>
            Keep your wallet data safe with encrypted backups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Backup Status</Label>
              <p className="text-sm text-muted-foreground">
                Current backup status
              </p>
            </div>
            <Badge variant={
              backupStatus === 'none' ? 'destructive' : 
              backupStatus === 'local' ? 'default' : 'secondary'
            }>
              {backupStatus === 'none' ? 'No Backup' : 
               backupStatus === 'local' ? 'Local Backup' : 'Cloud Backup'}
            </Badge>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isCreatingBackup ? 'Creating...' : 'Create Backup'}
            </Button>
            <Button variant="outline" className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Restore Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Change Password</span>
          </CardTitle>
          <CardDescription>
            Update your wallet password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleChangePassword} className="w-full">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Security Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Overall Security</span>
              <Badge variant="default">Good</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Encryption</span>
              <Badge variant="default">AES-256</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Backup Status</span>
              <Badge variant={backupStatus === 'none' ? 'destructive' : 'default'}>
                {backupStatus === 'none' ? 'Needs Backup' : 'Protected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}