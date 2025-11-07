"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, 
  Users, 
  Key, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Lock,
  Unlock,
  Fingerprint,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  TrendingUp,
  SecurityScan,
  UserCheck,
  Database,
  Network,
  Globe,
  Server,
  RefreshCw,
  X
} from "lucide-react";
import { merchantAuthService, type MerchantUser, type MerchantProfile, type ApiKey, type AuthDevice } from "@/lib/merchant-auth-service";

export default function MerchantManagementPage() {
  const { user, hasPermission, hasRole, getSecurityMetrics } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [merchantUsers, setMerchantUsers] = useState<MerchantUser[]>([]);
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [devices, setDevices] = useState<AuthDevice[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<any>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateApiKey, setShowCreateApiKey] = useState(false);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    email: "",
    name: "",
    roles: ["viewer"] as const,
    password: ""
  });

  const [newApiKeyForm, setNewApiKeyForm] = useState({
    name: "",
    permissions: [] as string[],
    expiresAt: ""
  });

  useEffect(() => {
    if (user?.merchantUser) {
      loadMerchantData();
    }
  }, [user]);

  const loadMerchantData = async () => {
    if (!user?.merchantUser) return;

    setLoading(true);
    try {
      // Simulate loading merchant data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock merchant users
      const mockUsers: MerchantUser[] = [
        {
          id: user.merchantUser.id,
          email: user.merchantUser.email,
          name: user.merchantUser.name,
          isMerchant: true,
          roles: user.merchantUser.roles,
          permissions: user.merchantUser.permissions,
          mfaEnabled: true,
          loginAttempts: 0,
          accountLocked: false,
          securityQuestions: [],
          devices: [
            {
              id: "device_1",
              deviceId: "desktop_001",
              deviceType: "desktop",
              deviceName: "Chrome on Windows",
              userAgent: "Mozilla/5.0...",
              ipAddress: "192.168.1.100",
              lastUsedAt: new Date().toISOString(),
              isTrusted: true,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          apiKeys: [
            {
              id: "api_1",
              name: "Production API Key",
              key: "mk_live_...",
              secret: "sk_live_...",
              permissions: [],
              lastUsedAt: new Date().toISOString(),
              isActive: true,
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          createdAt: user.merchantUser.createdAt,
          updatedAt: new Date().toISOString()
        }
      ];

      // Mock merchant profile
      const mockProfile: MerchantProfile = {
        id: "profile_1",
        userId: user.merchantUser.id,
        businessName: "MobBitWallet Technologies",
        businessType: "llc",
        registrationNumber: "123456789",
        taxId: "98-7654321",
        website: "https://mobbitwallet.com",
        phone: "+1-555-0123",
        address: {
          street: "123 Blockchain Avenue",
          city: "Crypto Valley",
          state: "CA",
          postalCode: "94000",
          country: "US"
        },
        businessCategory: "technology",
        monthlyVolume: "100k_500k",
        supportedCurrencies: ["USD", "EUR", "BTC", "ETH"],
        description: "Leading cryptocurrency payment solutions provider",
        verificationStatus: "approved",
        complianceLevel: "enhanced",
        kycCompleted: true,
        kycCompletedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        riskLevel: "low",
        createdAt: user.merchantUser.createdAt,
        updatedAt: new Date().toISOString()
      };

      setMerchantUsers(mockUsers);
      setMerchantProfile(mockProfile);
      setApiKeys(mockUsers[0]?.apiKeys || []);
      setDevices(mockUsers[0]?.devices || []);
      setSecurityMetrics(getSecurityMetrics());
    } catch (error) {
      console.error('Error loading merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.email || !newUserForm.name || !newUserForm.password) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const newUser = await merchantAuthService.createMerchantUser({
        email: newUserForm.email,
        name: newUserForm.name,
        password: newUserForm.password,
        roles: newUserForm.roles
      });

      setMerchantUsers(prev => [...prev, newUser]);
      setShowCreateUser(false);
      setNewUserForm({ email: "", name: "", roles: ["viewer"], password: "" });
    } catch (error) {
      alert("Failed to create user: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newApiKeyForm.name || newApiKeyForm.permissions.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      if (!user?.merchantUser) return;

      const newApiKey = merchantAuthService.createApiKey(user.merchantUser.id, {
        name: newApiKeyForm.name,
        permissions: newApiKeyForm.permissions.map(p => ({
          id: p,
          name: p,
          resource: p.split('_')[0],
          action: 'read' as any,
          description: p,
          category: 'payments' as any
        })),
        expiresAt: newApiKeyForm.expiresAt || undefined
      });

      setApiKeys(prev => [...prev, newApiKey]);
      setShowCreateApiKey(false);
      setNewApiKeyForm({ name: "", permissions: [], expiresAt: "" });
    } catch (error) {
      alert("Failed to create API key: " + error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user?.isMerchant) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              You need merchant access to view this page. Please contact your administrator.
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireMerchant={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Merchant Management</h1>
                  <p className="text-sm text-gray-600">
                    {merchantProfile?.businessName} • Security & Access Control
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified Merchant
                </Badge>
                <Button variant="outline" onClick={loadMerchantData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Security Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Score</p>
                    <p className="text-2xl font-bold text-green-600">
                      {securityMetrics?.securityScore || 0}/100
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <Progress value={securityMetrics?.securityScore || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold">{merchantUsers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">API Keys</p>
                    <p className="text-2xl font-bold">{apiKeys.filter(k => k.isActive).length}</p>
                  </div>
                  <Key className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold">{devices.filter(d => d.isTrusted).length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="api">API Keys</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="h-5 w-5" />
                      <span>Business Information</span>
                    </CardTitle>
                    <CardDescription>
                      Your merchant business profile and details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Business Name</Label>
                        <p className="font-medium">{merchantProfile?.businessName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Business Type</Label>
                        <p className="font-medium capitalize">{merchantProfile?.businessType}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Category</Label>
                        <p className="font-medium capitalize">{merchantProfile?.businessCategory}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Monthly Volume</Label>
                        <p className="font-medium">{merchantProfile?.monthlyVolume?.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Address</Label>
                      <p className="font-medium">
                        {merchantProfile?.address.street}<br />
                        {merchantProfile?.address.city}, {merchantProfile?.address.state} {merchantProfile?.address.postalCode}<br />
                        {merchantProfile?.address.country}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Badge className={getVerificationStatusColor(merchantProfile?.verificationStatus || '')}>
                        {merchantProfile?.verificationStatus?.replace('_', ' ')}
                      </Badge>
                      <Badge className={getRiskLevelColor(merchantProfile?.riskLevel || '')}>
                        Risk: {merchantProfile?.riskLevel}
                      </Badge>
                      <Badge variant="outline">
                        Compliance: {merchantProfile?.complianceLevel}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <SecurityScan className="h-5 w-5" />
                      <span>Security Status</span>
                    </CardTitle>
                    <CardDescription>
                      Current security posture and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Fingerprint className="h-4 w-4" />
                          <span>Multi-Factor Authentication</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <span className="text-sm text-green-600">Enabled</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lock className="h-4 w-4" />
                          <span>Device Approval</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <span className="text-sm text-green-600">Enabled</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4" />
                          <span>API Rate Limiting</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked />
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Network className="h-4 w-4" />
                          <span>IP Restrictions</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch />
                          <span className="text-sm text-gray-600">Disabled</span>
                        </div>
                      </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        Your account meets enhanced security standards. Consider enabling IP restrictions for additional protection.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <p className="text-gray-600">Manage user access and permissions</p>
                </div>
                <Button onClick={() => setShowCreateUser(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>

              {/* Create User Dialog */}
              {showCreateUser && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Create New User</CardTitle>
                        <CardDescription>Add a new user to your merchant account</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowCreateUser(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-name">Full Name *</Label>
                        <Input
                          id="user-name"
                          placeholder="John Doe"
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-email">Email Address *</Label>
                        <Input
                          id="user-email"
                          type="email"
                          placeholder="john@example.com"
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-password">Password *</Label>
                        <Input
                          id="user-password"
                          type="password"
                          placeholder="••••••••"
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <Select value={newUserForm.roles[0]} onValueChange={(value) => setNewUserForm({...newUserForm, roles: [value as any]})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="accountant">Accountant</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCreateUser} 
                      disabled={loading || !newUserForm.name || !newUserForm.email || !newUserForm.password}
                      className="w-full"
                    >
                      {loading ? "Creating User..." : "Create User"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>
                    All users with access to your merchant account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {merchantUsers.map((merchantUser) => (
                      <div key={merchantUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{merchantUser.name}</div>
                            <div className="text-sm text-gray-600">{merchantUser.email}</div>
                            <div className="flex space-x-2 mt-1">
                              {merchantUser.roles.map(role => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            {merchantUser.mfaEnabled ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Fingerprint className="h-3 w-3 mr-1" />
                                MFA Enabled
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                MFA Disabled
                              </Badge>
                            )}
                            {merchantUser.accountLocked ? (
                              <Badge className="bg-red-100 text-red-800">
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">
                                <Unlock className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            Last login: {merchantUser.lastLoginAt ? new Date(merchantUser.lastLoginAt).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Devices */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Monitor className="h-5 w-5" />
                      <span>Trusted Devices</span>
                    </CardTitle>
                    <CardDescription>
                      Devices that have access to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getDeviceIcon(device.deviceType)}
                            <div>
                              <div className="font-medium">{device.deviceName}</div>
                              <div className="text-sm text-gray-600">
                                {device.ipAddress} • {new Date(device.lastUsedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {device.isTrusted ? (
                              <Badge className="bg-green-100 text-green-800">Trusted</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Security Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Security Metrics</span>
                    </CardTitle>
                    <CardDescription>
                      Account security statistics and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {securityMetrics?.totalLogins || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Logins</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {securityMetrics?.failedLogins || 0}
                        </div>
                        <div className="text-sm text-gray-600">Failed Attempts</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Active Sessions</span>
                        <span className="font-medium">{securityMetrics?.activeSessions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">API Keys</span>
                        <span className="font-medium">{securityMetrics?.apiKeys || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Last Login</span>
                        <span className="font-medium">
                          {securityMetrics?.lastLogin ? new Date(securityMetrics.lastLogin).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                    </div>

                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        Your account security is excellent. Keep up the good security practices!
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">API Keys</h2>
                  <p className="text-gray-600">Manage API access for your applications</p>
                </div>
                <Button onClick={() => setShowCreateApiKey(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </div>

              {/* Create API Key Dialog */}
              {showCreateApiKey && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Create New API Key</CardTitle>
                        <CardDescription>Generate a new API key for application access</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowCreateApiKey(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key-name">Key Name *</Label>
                      <Input
                        id="api-key-name"
                        placeholder="Production App Key"
                        value={newApiKeyForm.name}
                        onChange={(e) => setNewApiKeyForm({...newApiKeyForm, name: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api-key-permissions">Permissions *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['payment_create', 'payment_read', 'transaction_read', 'customer_read'].map(permission => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={permission}
                              checked={newApiKeyForm.permissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewApiKeyForm(prev => ({
                                    ...prev,
                                    permissions: [...prev.permissions, permission]
                                  }));
                                } else {
                                  setNewApiKeyForm(prev => ({
                                    ...prev,
                                    permissions: prev.permissions.filter(p => p !== permission)
                                  }));
                                }
                              }}
                            />
                            <label htmlFor={permission} className="text-sm">
                              {permission.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api-key-expiry">Expiration Date (Optional)</Label>
                      <Input
                        id="api-key-expiry"
                        type="date"
                        value={newApiKeyForm.expiresAt}
                        onChange={(e) => setNewApiKeyForm({...newApiKeyForm, expiresAt: e.target.value})}
                      />
                    </div>

                    <Button 
                      onClick={handleCreateApiKey} 
                      disabled={loading || !newApiKeyForm.name || newApiKeyForm.permissions.length === 0}
                      className="w-full"
                    >
                      {loading ? "Creating API Key..." : "Create API Key"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* API Keys List */}
              <Card>
                <CardHeader>
                  <CardTitle>Active API Keys</CardTitle>
                  <CardDescription>
                    API keys for accessing your merchant account programmatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Key className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">{apiKey.name}</div>
                            <div className="text-sm text-gray-600 font-mono">
                              {apiKey.key}
                            </div>
                            <div className="text-xs text-gray-500">
                              Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                              {apiKey.expiresAt && ` • Expires: ${new Date(apiKey.expiresAt).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            {apiKey.isActive ? (
                              <Badge className="bg-green-100 text-green-800">Active</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                            )}
                            {apiKey.lastUsedAt && (
                              <Badge variant="outline">
                                Used: {new Date(apiKey.lastUsedAt).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5" />
                      <span>Compliance Status</span>
                    </CardTitle>
                    <CardDescription>
                      Regulatory compliance and verification status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Business Verification</span>
                        <Badge className={getVerificationStatusColor(merchantProfile?.verificationStatus || '')}>
                          {merchantProfile?.verificationStatus?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>KYC Completed</span>
                        <Badge className={merchantProfile?.kycCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {merchantProfile?.kycCompleted ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Compliance Level</span>
                        <Badge variant="outline">
                          {merchantProfile?.complianceLevel}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Risk Assessment</span>
                        <Badge className={getRiskLevelColor(merchantProfile?.riskLevel || '')}>
                          {merchantProfile?.riskLevel}
                        </Badge>
                      </div>
                    </div>

                    {merchantProfile?.kycCompletedAt && (
                      <div className="text-sm text-gray-600">
                        KYC completed on {new Date(merchantProfile.kycCompletedAt).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Supported Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Server className="h-5 w-5" />
                      <span>Account Features</span>
                    </CardTitle>
                    <CardDescription>
                      Enabled features and capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Payment Processing</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Recurring Payments</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Multi-Currency</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Enhanced Security</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4" />
                          <span>API Access</span>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        Your account has access to all premium features. Contact support for enterprise options.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}