import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="container max-w-3xl mx-auto">
        <div className="rounded-xl border border-border bg-card/95 backdrop-blur-lg shadow-lg p-4 sm:p-5 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Cookie className="w-5 h-5 text-primary shrink-0 hidden sm:block" />
            <p className="text-xs sm:text-sm text-muted-foreground flex-1 pr-6 sm:pr-0">
              We use essential cookies for authentication and session management.{" "}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button variant="ghost" size="sm" onClick={decline} className="text-muted-foreground h-10 sm:h-9 flex-1 sm:flex-none">
                Decline
              </Button>
              <Button size="sm" onClick={accept} className="h-10 sm:h-9 flex-1 sm:flex-none">
                Accept
              </Button>
            </div>
          </div>
          <button onClick={decline} className="absolute top-3 right-3 sm:hidden text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
