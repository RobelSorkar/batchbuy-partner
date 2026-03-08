import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);

  useEffect(() => {
    if (!requiredRole || !user) {
      setCheckingRole(false);
      setHasRole(true);
      return;
    }

    const checkRole = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", requiredRole)
        .maybeSingle();

      setHasRole(!!data);
      setCheckingRole(false);
    };

    checkRole();
  }, [user, requiredRole]);

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-display font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You don't have the required role to access this page.</p>
          <a href="/" className="text-primary hover:underline text-sm">Go Home</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
