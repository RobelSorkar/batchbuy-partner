import { Package } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { label: "About", href: "#" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Contact", href: "#" },
  { label: "Terms", href: "/terms", isRoute: true },
  { label: "Privacy", href: "/privacy", isRoute: true },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-10 px-6">
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold">ProdPartner</span>
        </div>

        <nav className="flex flex-wrap justify-center gap-6">
          {links.map((link) =>
            link.isRoute ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <p className="text-xs text-muted-foreground">
          © 2026 ProdPartner. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
