import { Package } from "lucide-react";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Team", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Case Studies", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Marketplace", href: "/marketplace", isRoute: true },
      { label: "Transparency", href: "/transparency", isRoute: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms", isRoute: true },
      { label: "Privacy", href: "/privacy", isRoute: true },
      { label: "Risk Disclaimer", href: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/50 pt-16 pb-8 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Package className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">ProdPartner</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              Bangladesh's inventory financing platform. Own products, sell anywhere.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-sm text-foreground mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 ProdPartner. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            এটি কোনো বিনিয়োগ প্ল্যাটফর্ম নয়। আপনি সরাসরি প্রোডাক্ট ইউনিটের মালিক হবেন।
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
