"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecuritySettings } from "@/components/auth/security-settings";
import { BiometricAuth } from "@/components/auth/biometric-auth";
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Palette, 
  User, 
  Lock, 
  Smartphone,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleAuthFailure = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Please authenticate to access your settings
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
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your wallet preferences and security
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Authenticated
          </Badge>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
              <CardDescription>
                Configure general wallet preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Default Currency</h4>
                    <p className="text-sm text-muted-foreground">
                      Set your preferred display currency
                    </p>
                  </div>
                  <Badge variant="outline">USD</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Language</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred language
                    </p>
                  </div>
                  <Badge variant="outline">English</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Time Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      Set your local time zone
                    </p>
                  </div>
                  <Badge variant="outline">UTC</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Transaction Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about transactions
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Price Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive price change notifications
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Security Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Important security notifications
                    </p>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Emails</h4>
                    <p className="text-sm text-muted-foreground">
                      Product updates and news
                    </p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Theme</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </p>
                  </div>
                  <Badge variant="outline">Light</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Font Size</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust text size for better readability
                    </p>
                  </div>
                  <Badge variant="outline">Medium</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Compact Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Use a more compact interface
                    </p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account</span>
              </CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Address</h4>
                    <p className="text-sm text-muted-foreground">
                      Your account email
                    </p>
                  </div>
                  <Badge variant="outline">user@example.com</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Account Status</h4>
                    <p className="text-sm text-muted-foreground">
                      Current account status
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Member Since</h4>
                    <p className="text-sm text-muted-foreground">
                      When you joined MobBitWallet
                    </p>
                  </div>
                  <Badge variant="outline">Nov 2024</Badge>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}