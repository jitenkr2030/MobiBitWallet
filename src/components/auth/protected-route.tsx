"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireMerchant?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true, requireMerchant = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push('/auth/login');
      } else if (requireMerchant && (!user || !user.isMerchant)) {
        router.push('/merchant-register');
      }
    }
  }, [user, loading, router, requireAuth, requireMerchant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requireMerchant && user && !user.isMerchant) {
    return null;
  }

  return <>{children}</>;
}