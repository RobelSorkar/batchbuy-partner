import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Calculator, Loader2, Upload, X, ImageIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { MINIMUM_PARTICIPATION_BDT, allocateUnits, calcPerUnitProfit, calcInvestmentEstimate } from "@/lib/calculations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";

const categories = ["Apparel", "Beauty", "Accessories", "Home & Kitchen", "Electronics", "Food & Beverage", "Health", "Sports"];

const CreateBatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload: uploadImage, uploading: imageUploading } = useImageUpload();
  const [form, setForm] = useState({
    productName: "", batchName: "", productionCostPerUnit: "", wholesalePrice: "", retailPrice: "",
    totalQuantity: "", category: "", description: "", manufacturer: "", warehouse: "", productionTimeDays: "", deadline: "",
    logisticsCostPerUnit: "40",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const costPerUnit = Number(form.productionCostPerUnit) || 0;
  const wholesale = Number(form.wholesalePrice) || 0;
  const retail = Number(form.retailPrice) || 0;
  const totalQty = Number(form.totalQuantity) || 0;
  const logisticsCost = Number(form.logisticsCostPerUnit) || 0;

  const totalProductionCost = costPerUnit * totalQty;
  const totalLogisticsCost = logisticsCost * totalQty;
  const totalWholesaleRevenue = wholesale * totalQty;
  const totalRetailRevenue = retail * totalQty;
  const wholesaleMargin = costPerUnit > 0 ? (((wholesale - costPerUnit - logisticsCost) * 0.85) / costPerUnit * 100).toFixed(1) : "0";
  const retailMargin = costPerUnit > 0 ? (((retail - costPerUnit - logisticsCost) * 0.85) / costPerUnit * 100).toFixed(1) : "0";
  const minUnitsForEntry = costPerUnit > 0 ? Math.ceil(MINIMUM_PARTICIPATION_BDT / costPerUnit) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    // Upload image if selected
    let imageUrl: string | null = null;
    if (imageFile) {
      const path = `batches/${Date.now()}-${imageFile.name}`;
      imageUrl = await uploadImage(imageFile, path);
    }

    const { error } = await supabase.from("batches").insert({
      product_name: form.productName,
      batch_name: form.batchName,
      production_cost_per_unit: costPerUnit,
      wholesale_price: wholesale,
      retail_price: retail,
      total_quantity: totalQty,
      remaining_units: totalQty,
      category: form.category || null,
      description: form.description || null,
      manufacturer: form.manufacturer || null,
      warehouse: form.warehouse || null,
      production_time_days: Number(form.productionTimeDays) || 30,
      deadline: form.deadline || null,
      created_by: user.id,
      status: "funding",
      image: imageUrl,
      logistics_cost_per_unit: logisticsCost,
    });

    setLoading(false);
    if (error) {
      toast({ title: "Failed to create batch", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Batch created!", description: `${form.batchName} is now live on the marketplace.` });
      navigate("/partner");
    }
  };

  return (
    <DashboardLayout role="partner">
      <div className="max-w-4xl space-y-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div>
          <h1 className="text-2xl font-display font-bold">Create New Batch</h1>
          <p className="text-muted-foreground text-sm mt-1">Set up a new production batch for partners to join</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 space-y-4">
              <h2 className="font-display font-semibold text-lg">Product Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input id="productName" placeholder="e.g. Premium Cotton T-Shirt" value={form.productName} onChange={(e) => update("productName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchName">Batch Name *</Label>
                  <Input id="batchName" placeholder="e.g. Batch #47 — Summer Collection" value={form.batchName} onChange={(e) => update("batchName", e.target.value)} required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => update("category", v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">Total Production Quantity *</Label>
                  <Input id="totalQuantity" type="number" min="1" placeholder="e.g. 500" value={form.totalQuantity} onChange={(e) => update("totalQuantity", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the product..." rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border/50">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Click to upload product image</span>
                  </button>
                )}
                {imageUploading && <p className="text-xs text-primary">Uploading image...</p>}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 space-y-4">
              <h2 className="font-display font-semibold text-lg">Pricing (BDT)</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productionCost">Production Cost / Unit *</Label>
                  <Input id="productionCost" type="number" min="1" placeholder="e.g. 300" value={form.productionCostPerUnit} onChange={(e) => update("productionCostPerUnit", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wholesalePrice">Wholesale Price *</Label>
                  <Input id="wholesalePrice" type="number" min="1" placeholder="e.g. 450" value={form.wholesalePrice} onChange={(e) => update("wholesalePrice", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retailPrice">Retail Price *</Label>
                  <Input id="retailPrice" type="number" min="1" placeholder="e.g. 650" value={form.retailPrice} onChange={(e) => update("retailPrice", e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logisticsCost">Logistics Cost / Unit (Delivery + Packaging + Warehouse + Returns + Damage)</Label>
                <Input id="logisticsCost" type="number" min="0" placeholder="e.g. 40" value={form.logisticsCostPerUnit} onChange={(e) => update("logisticsCostPerUnit", e.target.value)} />
                <p className="text-xs text-muted-foreground">Estimated per-unit cost for delivery, packaging, warehouse handling, return loss & damage</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-card border border-border/50 space-y-4">
              <h2 className="font-display font-semibold text-lg">Production Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" placeholder="e.g. Dhaka Textile Mills Ltd." value={form.manufacturer} onChange={(e) => update("manufacturer", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Input id="warehouse" placeholder="e.g. Gazipur Central Warehouse" value={form.warehouse} onChange={(e) => update("warehouse", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productionTime">Estimated Production Time (days)</Label>
                <Input id="productionTime" type="number" min="1" placeholder="e.g. 21" value={form.productionTimeDays} onChange={(e) => update("productionTimeDays", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Funding Deadline *</Label>
                <Input id="deadline" type="date" min={new Date().toISOString().split("T")[0]} value={form.deadline} onChange={(e) => update("deadline", e.target.value)} required />
                <p className="text-xs text-muted-foreground">Batch will auto-close after this date if not fully funded</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create Batch
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card rounded-xl shadow-card border border-border/50 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold">Batch Summary</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Production Cost</span><span className="font-semibold">৳{totalProductionCost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Logistics Cost</span><span className="font-semibold">৳{totalLogisticsCost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Wholesale Revenue</span><span className="font-semibold">৳{totalWholesaleRevenue.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Retail Revenue</span><span className="font-semibold">৳{totalRetailRevenue.toLocaleString()}</span></div>
                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Net Wholesale ROI</span><span className="font-semibold text-primary">{wholesaleMargin}%</span></div>
                  <div className="flex justify-between mt-1"><span className="text-muted-foreground">Net Retail ROI</span><span className="font-semibold text-primary">{retailMargin}%</span></div>
                  <p className="text-[10px] text-muted-foreground mt-1">After logistics + 15% platform fee</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                    <span>✔ Estimate only</span>
                    <span>✔ Not guaranteed</span>
                  </div>
                </div>
                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">Min Participation</span><span className="font-semibold">৳{MINIMUM_PARTICIPATION_BDT.toLocaleString()}</span></div>
                  <div className="flex justify-between mt-1"><span className="text-muted-foreground">Min Units to Join</span><span className="font-semibold">{minUnitsForEntry || "—"} units</span></div>
                </div>
              </div>
              {costPerUnit > 0 && totalQty > 0 && (
                <div className="bg-accent/50 rounded-lg p-4 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">Example: ৳10,000 financing</p>
                  <p className="text-sm font-medium">= {Math.floor(10000 / costPerUnit)} units financed</p>
                  <p className="text-xs text-primary mt-1">Net profit: ৳{Math.round(Math.floor(10000 / costPerUnit) * (retail - costPerUnit - logisticsCost) * 0.85).toLocaleString()} <span className="text-muted-foreground">(after logistics + 15% fee)</span></p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateBatch;
