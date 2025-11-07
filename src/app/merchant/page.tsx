"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Users, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Zap,
  BarChart3,
  Settings,
  Bell,
  Shield,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

interface MerchantStats {
  totalRevenue: number;
  todayRevenue: number;
  totalTransactions: number;
  todayTransactions: number;
  activeCustomers: number;
  averageOrderValue: number;
  pendingPayments: number;
  failedPayments: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  lastOrder: string;
  status: 'active' | 'inactive';
}

interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
  paymentMethod: 'bitcoin' | 'lightning' | 'other';
  description: string;
}

export default function MerchantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MerchantStats>({
    totalRevenue: 0,
    todayRevenue: 0,
    totalTransactions: 0,
    todayTransactions: 0,
    activeCustomers: 0,
    averageOrderValue: 0,
    pendingPayments: 0,
    failedPayments: 0
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadMerchantData();
  }, []);

  const loadMerchantData = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock stats
      const mockStats: MerchantStats = {
        totalRevenue: 15420.50,
        todayRevenue: 1250.75,
        totalTransactions: 847,
        todayTransactions: 23,
        activeCustomers: 156,
        averageOrderValue: 18.20,
        pendingPayments: 5,
        failedPayments: 2
      };

      // Mock products
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Premium Coffee",
          price: 4.50,
          currency: "USD",
          category: "Beverages",
          stock: 45,
          status: "active"
        },
        {
          id: "2",
          name: "Artisan Sandwich",
          price: 8.99,
          currency: "USD",
          category: "Food",
          stock: 12,
          status: "active"
        },
        {
          id: "3",
          name: "Fresh Salad",
          price: 6.99,
          currency: "USD",
          category: "Food",
          stock: 0,
          status: "out_of_stock"
        },
        {
          id: "4",
          name: "Smoothie Bowl",
          price: 7.50,
          currency: "USD",
          category: "Beverages",
          stock: 8,
          status: "active"
        }
      ];

      // Mock customers
      const mockCustomers: Customer[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          totalSpent: 245.50,
          orderCount: 12,
          lastOrder: "2024-01-15T14:30:00Z",
          status: "active"
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          totalSpent: 189.75,
          orderCount: 8,
          lastOrder: "2024-01-14T10:15:00Z",
          status: "active"
        },
        {
          id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          totalSpent: 456.25,
          orderCount: 23,
          lastOrder: "2024-01-13T16:45:00Z",
          status: "active"
        }
      ];

      // Mock transactions
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          customerId: "1",
          customerName: "John Doe",
          amount: 4.50,
          currency: "USD",
          status: "completed",
          timestamp: "2024-01-15T14:30:00Z",
          paymentMethod: "lightning",
          description: "Premium Coffee"
        },
        {
          id: "2",
          customerId: "2",
          customerName: "Jane Smith",
          amount: 8.99,
          currency: "USD",
          status: "completed",
          timestamp: "2024-01-15T10:15:00Z",
          paymentMethod: "bitcoin",
          description: "Artisan Sandwich"
        },
        {
          id: "3",
          customerId: "3",
          customerName: "Bob Johnson",
          amount: 7.50,
          currency: "USD",
          status: "pending",
          timestamp: "2024-01-14T16:45:00Z",
          paymentMethod: "lightning",
          description: "Smoothie Bowl"
        }
      ];

      setStats(mockStats);
      setProducts(mockProducts);
      setCustomers(mockCustomers);
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "inactive":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "out_of_stock":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "bitcoin":
        return <CreditCard className="h-4 w-4" />;
      case "lightning":
        return <Zap className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading merchant dashboard...</p>
        </div>
      </div>
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
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Payment
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</p>
                    <p className="text-sm text-gray-600">{stats.todayTransactions} transactions</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8 new today
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {stats.failedPayments} failed
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Transactions
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-full">
                              {getPaymentMethodIcon(transaction.paymentMethod)}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.customerName}</p>
                              <p className="text-sm text-gray-600">{transaction.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common merchant operations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="h-20 flex-col" variant="outline">
                        <QrCode className="h-6 w-6 mb-2" />
                        Create Payment QR
                      </Button>
                      <Button className="h-20 flex-col" variant="outline">
                        <Plus className="h-6 w-6 mb-2" />
                        Add Product
                      </Button>
                      <Button className="h-20 flex-col" variant="outline">
                        <Download className="h-6 w-6 mb-2" />
                        Export Reports
                      </Button>
                      <Button className="h-20 flex-col" variant="outline">
                        <RefreshCw className="h-6 w-6 mb-2" />
                        Sync Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Alert className="border-blue-200 bg-blue-50">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    You have {stats.pendingPayments} pending payments awaiting confirmation.
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Your merchant account is in good standing. All features are enabled.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Payment History
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-full">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.customerName}</div>
                            <div className="text-sm text-gray-600">{transaction.description}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Product Inventory
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600">{product.category}</div>
                            <div className="text-sm text-gray-500">
                              Stock: {product.stock} units
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(product.price)}</div>
                          <Badge className={getStatusColor(product.status)}>
                            {product.status.replace('_', ' ')}
                          </Badge>
                          <div className="flex space-x-2 mt-2">
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

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Customer Management
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search customers..." className="pl-10 w-64" />
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.email}</div>
                            <div className="text-sm text-gray-500">
                              {customer.orderCount} orders • Last: {new Date(customer.lastOrder).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
                          <Badge className={getStatusColor(customer.status)}>
                            {customer.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>Monthly revenue trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Revenue chart would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Distribution of payment methods</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <PieChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Payment method chart would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key business indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.averageOrderValue}</div>
                      <div className="text-sm text-gray-600">Average Order Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {((stats.totalRevenue / stats.totalTransactions) || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Revenue per Transaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((stats.activeCustomers / stats.totalTransactions) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Customer Retention</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Mock PieChart component
function PieChart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M12 2 L12 12 L20 12" strokeWidth="2" />
    </svg>
  );
}