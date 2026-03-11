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
    <footer className="border-t border-border pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-10">
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-sm">ProdPartner</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
              Bangladesh's inventory financing platform. Own products, sell anywhere.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-foreground mb-2.5 sm:mb-3 uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link to={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5 inline-block">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5 inline-block">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 sm:pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center sm:text-left">© 2026 ProdPartner. All rights reserved.</p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground text-center sm:text-right">এটি বিনিয়োগ প্ল্যাটফর্ম নয়। আপনি প্রোডাক্ট ইউনিটের মালিক হবেন।</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
