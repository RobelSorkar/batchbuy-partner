import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-xl font-display font-bold">Check Your Email</h1>
          <p className="text-muted-foreground text-sm">We've sent a password reset link to <strong>{email}</strong>. Check your inbox and spam folder.</p>
          <Link to="/login"><Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center mb-4">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold">Forgot Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Send Reset Link
          </Button>
        </form>

        <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
