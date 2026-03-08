import { Package } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold">ProdPartner</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 Production Partnership Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
