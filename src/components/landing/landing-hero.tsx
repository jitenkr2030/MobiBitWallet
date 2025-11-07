"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  TrendingUp, 
  Smartphone, 
  Globe, 
  Lock,
  CheckCircle,
  Star,
  Users,
  CreditCard
} from "lucide-react";

export function LandingHero() {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Bank-Grade Security",
      description: "Military-grade encryption and multi-signature technology to protect your assets."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Instant Bitcoin payments via Lightning Network with near-zero fees."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "Real-time Market Data",
      description: "Live cryptocurrency prices and portfolio analytics from CoinGecko API."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-purple-600" />,
      title: "Mobile First",
      description: "Beautiful, responsive design that works perfectly on all devices."
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: <Users className="h-5 w-5" /> },
    { label: "Transactions", value: "2M+", icon: <CreditCard className="h-5 w-5" /> },
    { label: "Countries", value: "150+", icon: <Globe className="h-5 w-5" /> },
    { label: "Security Rating", value: "A+", icon: <Lock className="h-5 w-5" /> }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">MobBitWallet</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
            <a href="#security" className="text-gray-700 hover:text-blue-600 transition-colors">Security</a>
            <a href="#merchant" className="text-gray-700 hover:text-blue-600 transition-colors">Merchant</a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.location.href = '/auth/login'}>
              Sign In
            </Button>
            <Button onClick={() => window.location.href = '/auth/register'}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Star className="h-4 w-4 mr-2" />
            Trusted by 50,000+ users worldwide
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Be Your Own
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}Bank
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of cryptocurrency with MobBitWallet. 
            Secure, private, and borderless Bitcoin wallet with Lightning Network support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="px-8 py-4 text-lg" onClick={() => window.location.href = '/auth/register'}>
              Create Free Wallet
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg" onClick={() => window.location.href = '/merchant'}>
              For Merchants
              <CreditCard className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Wallet
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed for both beginners and advanced users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Crypto?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust MobBitWallet for their cryptocurrency needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg" onClick={() => window.location.href = '/auth/register'}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600" onClick={() => window.location.href = '/demo'}>
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}