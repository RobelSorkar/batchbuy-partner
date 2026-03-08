import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, Mail, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const location = useLocation();
  const email = (location.state as any)?.email || "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    if (!email) {
      toast({ title: "No email found", description: "Please sign up again.", variant: "destructive" });
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setResending(false);
    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      setResent(true);
      toast({ title: "Email sent!", description: "Check your inbox for the verification link." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">ProdPartner</span>
        </Link>

        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-display font-bold mb-2">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a verification link to{" "}
            {email ? <span className="font-medium text-foreground">{email}</span> : "your email"}.
            Click the link to activate your account.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2 border border-border/50">
          <p>Didn't receive it? Check your spam folder, or click below to resend.</p>
        </div>

        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resending}
          className="w-full"
        >
          {resending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : resent ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {resent ? "Sent! Resend again" : "Resend verification email"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Already verified?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
