import { useState } from "react";
import { z } from "zod";
import { ShoppingBag, Loader2, CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে").max(100),
  customerPhone: z.string().trim().regex(/^01[3-9]\d{8}$/, "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)"),
  customerAddress: z.string().trim().min(5, "ঠিকানা কমপক্ষে ৫ অক্ষর হতে হবে").max(300),
});

interface CustomerOrderFormProps {
  batchId: string;
  productName: string;
  retailPrice: number;
  referrerId: string;
  image?: string;
  stock?: number;
}

const CustomerOrderForm = ({
  batchId,
  productName,
  retailPrice,
  referrerId,
  image,
  stock,
}: CustomerOrderFormProps) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; totalAmount: number } | null>(null);
  const { toast } = useToast();

  const totalAmount = retailPrice * quantity;

  const handleSubmit = async () => {
    const result = orderSchema.safeParse({ customerName, customerPhone, customerAddress });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        errors[e.path[0] as string] = e.message;
      });
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-public-order", {
        body: {
          customerName: result.data.customerName,
          customerPhone: result.data.customerPhone,
          customerAddress: result.data.customerAddress,
          batchId,
          quantity,
          referrerId,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setOrderSuccess({
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
      });
    } catch (err: any) {
      toast({
        title: "সমস্যা হয়েছে",
        description: err.message || "অর্ডার তৈরি করা যায়নি",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4 text-center">
        <CheckCircle className="w-12 h-12 text-primary mx-auto" />
        <h3 className="text-lg font-display font-bold text-primary">অর্ডার সফল হয়েছে!</h3>
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">অর্ডার নম্বর:</p>
          <p className="font-mono font-bold text-lg">{orderSuccess.orderNumber}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          মোট: <span className="font-semibold text-foreground">৳{orderSuccess.totalAmount.toLocaleString()}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg">অর্ডার করুন</h3>
          <p className="text-xs text-muted-foreground">ক্যাশ অন ডেলিভারি</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center overflow-hidden">
          {image && image.startsWith("http") ? (
            <img src={image} alt={productName} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{productName}</p>
          <p className="text-lg font-display font-bold text-primary">৳{retailPrice.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1.5 block">পরিমাণ</label>
          <Input
            type="number"
            min={1}
            max={stock || 100}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">আপনার নাম *</label>
          <Input
            value={customerName}
            onChange={(e) => { setCustomerName(e.target.value); setFieldErrors((p) => ({ ...p, customerName: "" })); }}
            placeholder="পুরো নাম"
            className={fieldErrors.customerName ? "border-destructive" : ""}
          />
          {fieldErrors.customerName && <p className="text-xs text-destructive mt-1">{fieldErrors.customerName}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">ফোন নম্বর *</label>
          <Input
            value={customerPhone}
            onChange={(e) => { setCustomerPhone(e.target.value); setFieldErrors((p) => ({ ...p, customerPhone: "" })); }}
            placeholder="01XXXXXXXXX"
            className={fieldErrors.customerPhone ? "border-destructive" : ""}
          />
          {fieldErrors.customerPhone && <p className="text-xs text-destructive mt-1">{fieldErrors.customerPhone}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">ডেলিভারি ঠিকানা *</label>
          <Input
            value={customerAddress}
            onChange={(e) => { setCustomerAddress(e.target.value); setFieldErrors((p) => ({ ...p, customerAddress: "" })); }}
            placeholder="সম্পূর্ণ ঠিকানা"
            className={fieldErrors.customerAddress ? "border-destructive" : ""}
          />
          {fieldErrors.customerAddress && <p className="text-xs text-destructive mt-1">{fieldErrors.customerAddress}</p>}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">মূল্য ({quantity}টি)</span>
          <span className="font-semibold">৳{totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
          <span className="font-semibold text-primary">ফ্রি</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-primary/20">
          <span className="font-semibold">মোট</span>
          <span className="font-bold text-lg">৳{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> অর্ডার করা হচ্ছে...
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4 mr-2" /> অর্ডার কনফার্ম করুন
          </>
        )}
      </Button>

      <p className="text-[10px] text-muted-foreground text-center">
        ক্যাশ অন ডেলিভারি · পণ্য হাতে পেয়ে টাকা দিন
      </p>
    </div>
  );
};

export default CustomerOrderForm;
