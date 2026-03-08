import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl font-display font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 8, 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-display [&_h2]:font-semibold [&_h2]:text-lg [&_h2]:mb-3 [&_p]:leading-relaxed [&_li]:leading-relaxed">
          <section>
            <h2>1. Information We Collect</h2>
            <p><strong>Account Information:</strong> Full name, email address, phone number, and physical address provided during registration.</p>
            <p><strong>Financial Information:</strong> Wallet transactions, investment history, withdrawal details, and payment method information (bKash, Nagad, Rocket account numbers).</p>
            <p><strong>Usage Data:</strong> Pages visited, features used, device information, IP address, and browser type.</p>
            <p><strong>Business Data:</strong> Batch participation records, order history, inventory interactions, and distribution channel activity.</p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use collected information to: operate and maintain your account; process financial transactions and distribute profits; send notifications about batch updates, orders, and wallet activity; improve Platform features and user experience; comply with legal and regulatory requirements; prevent fraud and enforce our Terms of Service.</p>
          </section>

          <section>
            <h2>3. Data Storage & Security</h2>
            <p>All data is stored on secure, encrypted servers. Financial transactions are processed through atomic database operations with row-level security. We maintain comprehensive audit logs for all sensitive operations including wallet changes, role assignments, and administrative actions. Passwords are hashed and never stored in plain text.</p>
          </section>

          <section>
            <h2>4. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with: payment processors (bKash, Nagad, Rocket) to facilitate transactions; logistics partners for order fulfillment and shipping; law enforcement when required by applicable law; service providers who assist in Platform operations, under strict confidentiality agreements.</p>
          </section>

          <section>
            <h2>5. Role-Based Access</h2>
            <p>Access to data within the Platform is controlled by role-based permissions. Users can only view data relevant to their role. Administrators have broader access for Platform management, subject to audit logging. Warehouse managers can view order and inventory data necessary for fulfillment.</p>
          </section>

          <section>
            <h2>6. Cookies & Tracking</h2>
            <p>We use essential cookies for authentication and session management. No third-party advertising cookies are used. You may disable cookies in your browser settings, though this may affect Platform functionality.</p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to: access your personal data through your account dashboard; correct inaccurate information via your profile settings; request deletion of your account and associated data; export your transaction history; withdraw consent for optional data processing.</p>
          </section>

          <section>
            <h2>8. Data Retention</h2>
            <p>Account data is retained for the duration of your account plus 5 years for regulatory compliance. Financial transaction records are retained for 10 years as required by Bangladesh financial regulations. Audit logs are retained indefinitely for security purposes. You may request earlier deletion of non-regulated data.</p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>The Platform is not intended for users under 18 years of age. We do not knowingly collect data from minors. If we discover that a minor has created an account, we will promptly terminate it and delete associated data.</p>
          </section>

          <section>
            <h2>10. International Data Transfers</h2>
            <p>Your data is primarily stored and processed in Bangladesh. If data needs to be transferred internationally for backup or processing purposes, we ensure equivalent data protection standards are maintained.</p>
          </section>

          <section>
            <h2>11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Material changes will be communicated via email and in-app notification at least 14 days before taking effect. Continued use of the Platform after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>For privacy-related inquiries, contact our Data Protection Officer at <span className="text-primary">privacy@prodpartner.com</span>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
