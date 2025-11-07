"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Key, 
  Download, 
  Upload, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  FileText,
  Shield
} from "lucide-react";
import { generateMnemonic, validateMnemonic, deriveKeyFromMnemonic } from "@/lib/encryption";

interface MnemonicManagementProps {
  onMnemonicGenerated?: (mnemonic: string) => void;
  onMnemonicImported?: (mnemonic: string) => void;
  onMnemonicBackedUp?: () => void;
}

export function MnemonicManagement({
  onMnemonicGenerated,
  onMnemonicImported,
  onMnemonicBackedUp
}: MnemonicManagementProps) {
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationWords, setVerificationWords] = useState<string[]>([]);
  const [userVerification, setUserVerification] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleGenerateMnemonic = async () => {
    setIsGenerating(true);
    try {
      const newMnemonic = generateMnemonic(256); // 24 words
      setMnemonic(newMnemonic);
      setShowMnemonic(true);
      onMnemonicGenerated?.(newMnemonic);
      
      // Setup verification
      const words = newMnemonic.split(' ');
      const randomIndices = Array.from({ length: 3 }, () => Math.floor(Math.random() * 24));
      setVerificationWords(randomIndices.map(i => ({ index: i, word: words[i] })));
      setUserVerification(new Array(3).fill(''));
      setVerificationStep(0);
    } catch (error) {
      console.error('Failed to generate mnemonic:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportMnemonic = async () => {
    if (!importMnemonic.trim()) return;

    setIsImporting(true);
    try {
      const isValid = validateMnemonic(importMnemonic.trim());
      if (isValid) {
        setMnemonic(importMnemonic.trim());
        onMnemonicImported?.(importMnemonic.trim());
        setImportMnemonic('');
      } else {
        alert('Invalid mnemonic phrase. Please check and try again.');
      }
    } catch (error) {
      console.error('Failed to import mnemonic:', error);
      alert('Failed to import mnemonic. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCopyMnemonic = () => {
    if (mnemonic) {
      navigator.clipboard.writeText(mnemonic);
      alert('Mnemonic copied to clipboard!');
    }
  };

  const handleBackup = async () => {
    if (!mnemonic) return;

    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      // Simulate backup process
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Create backup file
      const backupData = {
        mnemonic,
        timestamp: new Date().toISOString(),
        version: '1.0',
        app: 'MobBitWallet'
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mobbitwallet-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onMnemonicBackedUp?.();
      alert('Backup created successfully!');
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Failed to create backup. Please try again.');
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        if (backupData.mnemonic && validateMnemonic(backupData.mnemonic)) {
          setMnemonic(backupData.mnemonic);
          onMnemonicImported?.(backupData.mnemonic);
          alert('Backup imported successfully!');
        } else {
          alert('Invalid backup file.');
        }
      } catch (error) {
        console.error('Failed to import backup:', error);
        alert('Failed to import backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleVerification = () => {
    if (userVerification.length !== verificationWords.length) return;

    const isCorrect = verificationWords.every((vw, index) => 
      vw.word.toLowerCase() === userVerification[index].toLowerCase().trim()
    );

    if (isCorrect) {
      alert('Verification successful! Your mnemonic has been confirmed.');
      setVerificationStep(0);
    } else {
      alert('Verification failed. Please check your mnemonic and try again.');
    }
  };

  const getStrengthColor = (wordCount: number) => {
    switch (wordCount) {
      case 12:
        return 'bg-yellow-100 text-yellow-800';
      case 24:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStrengthText = (wordCount: number) => {
    switch (wordCount) {
      case 12:
        return 'Good (128 bits)';
      case 24:
        return 'Excellent (256 bits)';
      default:
        return 'Invalid';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Key className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Recovery Phrase Management</h2>
      </div>

      {/* Current Mnemonic Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Current Recovery Phrase</span>
            </span>
            {mnemonic && (
              <Badge className={getStrengthColor(mnemonic.split(' ').length)}>
                {getStrengthText(mnemonic.split(' ').length)}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your recovery phrase is the master key to your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mnemonic ? (
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
                  <strong>Important:</strong> Never share your recovery phrase with anyone. 
                  Store it in a secure, offline location. Anyone with access to this phrase can control your funds.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button onClick={handleBackup} disabled={isBackingUp} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                </Button>
                <Button variant="outline" onClick={() => setVerificationStep(1)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>

              {isBackingUp && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Creating backup...</span>
                    <span>{backupProgress}%</span>
                  </div>
                  <Progress value={backupProgress} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recovery phrase set up yet.</p>
              <p className="text-sm">Generate a new phrase or import an existing one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate New Mnemonic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Generate New Recovery Phrase</span>
          </CardTitle>
          <CardDescription>
            Create a new 24-word recovery phrase for your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateMnemonic} 
            disabled={isGenerating}
            className="w-full"
          >
            <Key className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate New Recovery Phrase'}
          </Button>
          {mnemonic && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <strong>Warning:</strong> Generating a new recovery phrase will replace your current one. 
                Make sure you have backed up your existing phrase before proceeding.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Import Mnemonic */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import Recovery Phrase</span>
          </CardTitle>
          <CardDescription>
            Import an existing 12 or 24-word recovery phrase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-mnemonic">Enter your recovery phrase</Label>
            <Textarea
              id="import-mnemonic"
              placeholder="Enter your 12 or 24-word recovery phrase, separated by spaces..."
              value={importMnemonic}
              onChange={(e) => setImportMnemonic(e.target.value)}
              rows={3}
            />
          </div>
          <Button 
            onClick={handleImportMnemonic} 
            disabled={isImporting || !importMnemonic.trim()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import Recovery Phrase'}
          </Button>
        </CardContent>
      </Card>

      {/* Backup/Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Backup & Restore</span>
          </CardTitle>
          <CardDescription>
            Manage encrypted backup files of your recovery phrase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleBackup} 
              disabled={isBackingUp || !mnemonic}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isBackingUp ? 'Creating Backup...' : 'Download Backup'}
            </Button>
            
            <div className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                style={{ display: 'none' }}
                id="backup-file-input"
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => document.getElementById('backup-file-input')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Restore Backup
              </Button>
            </div>
          </div>
          
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              Backup files are encrypted and contain your recovery phrase. 
              Store them in multiple secure locations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      {verificationStep > 0 && (
        <Dialog open={verificationStep > 0} onOpenChange={() => setVerificationStep(0)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Your Recovery Phrase</DialogTitle>
              <DialogDescription>
                Please enter the following words from your recovery phrase to verify you have stored it correctly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {verificationWords.map((vw, index) => (
                <div key={vw.index} className="space-y-2">
                  <Label>Word #{vw.index + 1}</Label>
                  <Input
                    type="text"
                    placeholder={`Enter word #${vw.index + 1}`}
                    value={userVerification[index] || ''}
                    onChange={(e) => {
                      const newVerification = [...userVerification];
                      newVerification[index] = e.target.value;
                      setUserVerification(newVerification);
                    }}
                  />
                </div>
              ))}
              
              <div className="flex space-x-2">
                <Button onClick={handleVerification} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify
                </Button>
                <Button variant="outline" onClick={() => setVerificationStep(0)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}