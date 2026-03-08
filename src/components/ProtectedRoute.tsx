import { ReactNode, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);
  const [hasAnyRole, setHasAnyRole] = useState<boolean | null>(null);

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
        .eq("role", requiredRole as any)
        .maybeSingle();

      const { data: allRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      setHasRole(!!data);
      setHasAnyRole(!!(allRoles && allRoles.length > 0));
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
    if (!hasAnyRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold">Email Not Verified</h1>
            <p className="text-muted-foreground text-sm">
              Please check your inbox and click the verification link to activate your account. 
              Once verified, sign in again to access your dashboard.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login">
                <Button className="w-full">Go to Sign In</Button>
              </Link>
              <Link to="/" className="text-primary hover:underline text-sm">Go Home</Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold">Access Denied</h1>
          <p className="text-muted-foreground text-sm">
            You don't have the <span className="font-medium text-foreground">{requiredRole}</span> role required to access this page.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/">
              <Button variant="outline" className="w-full">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
