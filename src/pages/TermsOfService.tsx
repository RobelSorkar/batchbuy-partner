import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-display font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 8, 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-display [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mb-3 [&_p]:leading-relaxed [&_li]:leading-relaxed">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using ProdPartner ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Platform. These terms apply to all users, including Production Partners, Dropshippers, Distributors, and Warehouse Managers.</p>
          </section>

          <section>
            <h2>2. Platform Description</h2>
            <p>ProdPartner is a production partnership platform that enables users to invest in product batches, sell products through various distribution channels, and manage inventory and orders. The Platform facilitates connections between investors, sellers, and logistics providers.</p>
          </section>

          <section>
            <h2>3. Account Registration</h2>
            <p>You must provide accurate, complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. You must be at least 18 years old to use the Platform. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2>4. User Roles & Responsibilities</h2>
            <p><strong>Production Partners</strong> invest in product batches and earn profit proportional to their ownership. Partners acknowledge the inherent risk of investment and that returns are not guaranteed.</p>
            <p><strong>Dropshippers</strong> list and sell products from the Platform's inventory. Commissions are earned upon successful delivery of orders.</p>
            <p><strong>Distributors</strong> handle bulk distribution and are responsible for maintaining agreed-upon service levels.</p>
            <p><strong>Warehouse Managers</strong> manage inventory storage, order fulfillment, and shipping logistics.</p>
          </section>

          <section>
            <h2>5. Financial Terms</h2>
            <p>All financial transactions are conducted in Bangladeshi Taka (BDT/৳). Investments in batches are binding once confirmed. The Platform retains a 15% platform fee on profit distributions. Withdrawals are subject to daily limits and processing times. Deposits are credited upon verification of payment.</p>
          </section>

          <section>
            <h2>6. Wallet & Transactions</h2>
            <p>Each user is provided a digital wallet for managing funds. The Platform supports deposits and withdrawals through bKash, Nagad, and Rocket. All wallet transactions are logged and auditable. The Platform reserves the right to freeze wallets in cases of suspected fraud or policy violations.</p>
          </section>

          <section>
            <h2>7. Batch Participation</h2>
            <p>Participation in batches is subject to availability and minimum investment requirements. Once a batch is fully funded, investments cannot be withdrawn. Batch status transitions (funding → production → completed) are managed by the Platform. Profit distribution occurs automatically upon order delivery.</p>
          </section>

          <section>
            <h2>8. Prohibited Activities</h2>
            <p>Users may not: manipulate pricing or inventory data; create multiple accounts to circumvent limits; engage in fraudulent transactions; attempt to exploit platform vulnerabilities; use the Platform for money laundering or illegal activities; interfere with other users' accounts or transactions.</p>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>The Platform is provided "as is" without warranties of any kind. ProdPartner is not liable for investment losses, supply chain delays, or third-party service failures. Our total liability shall not exceed the amount held in your wallet at the time of the claim.</p>
          </section>

          <section>
            <h2>10. Termination</h2>
            <p>We may suspend or terminate accounts that violate these terms. Upon termination, remaining wallet balances (minus any outstanding obligations) will be returned within 30 business days. Users may request account deletion at any time.</p>
          </section>

          <section>
            <h2>11. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Users will be notified of material changes via email and in-app notification. Continued use after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2>12. Governing Law</h2>
            <p>These terms are governed by the laws of Bangladesh. Any disputes shall be resolved through arbitration in Dhaka, Bangladesh.</p>
          </section>

          <section>
            <h2>13. Contact</h2>
            <p>For questions about these terms, contact us at <span className="text-primary">legal@prodpartner.com</span>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
