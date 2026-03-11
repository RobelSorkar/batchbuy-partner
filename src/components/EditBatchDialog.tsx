import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";

interface EditBatchDialogProps {
  batch: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditBatchDialog = ({ batch, open, onOpenChange }: EditBatchDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { upload, uploading } = useImageUpload();
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    product_name: "",
    batch_name: "",
    category: "",
    description: "",
    wholesale_price: "",
    retail_price: "",
    manufacturer: "",
    warehouse: "",
    deadline: "",
    logistics_cost_per_unit: "",
  });

  useEffect(() => {
    if (batch) {
      setForm({
        product_name: batch.product_name || "",
        batch_name: batch.batch_name || "",
        category: batch.category || "",
        description: batch.description || "",
        wholesale_price: String(batch.wholesale_price || ""),
        retail_price: String(batch.retail_price || ""),
        manufacturer: batch.manufacturer || "",
        warehouse: batch.warehouse || "",
        deadline: batch.deadline ? new Date(batch.deadline).toISOString().slice(0, 16) : "",
        logistics_cost_per_unit: String(batch.logistics_cost_per_unit || 0),
      });
      setImagePreview(batch.image && batch.image.startsWith("http") ? batch.image : null);
      setImageFile(null);
    }
  }, [batch]);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = batch.image;

      if (imageFile) {
        const url = await upload(imageFile, `batch-${batch.id}-${Date.now()}.${imageFile.name.split(".").pop()}`);
        if (url) imageUrl = url;
      }

      const updates: Record<string, any> = {
        product_name: form.product_name,
        batch_name: form.batch_name,
        category: form.category || null,
        description: form.description || null,
        wholesale_price: Number(form.wholesale_price),
        retail_price: Number(form.retail_price),
        manufacturer: form.manufacturer || null,
        warehouse: form.warehouse || null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        logistics_cost_per_unit: Number(form.logistics_cost_per_unit) || 0,
        image: imageUrl,
      };

      const { error } = await supabase.from("batches").update(updates).eq("id", batch.id);
      if (error) throw error;

      toast({ title: "Batch updated", description: `${form.product_name} has been updated successfully.` });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch", batch.id] });
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!batch) return null;

  const hasFunding = batch.funded_units > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Project — {batch.product_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Image */}
          <div>
            <Label>Product Image</Label>
            <div className="mt-2 flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border border-dashed border-border flex items-center justify-center text-3xl">
                  {batch.image && !batch.image.startsWith("http") ? batch.image : "📦"}
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                <Button variant="outline" size="sm" asChild>
                  <span className="gap-2"><Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading..." : "Change Image"}</span>
                </Button>
              </label>
            </div>
          </div>

          {/* Product details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Name</Label>
              <Input value={form.product_name} onChange={(e) => update("product_name", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Batch Name</Label>
              <Input value={form.batch_name} onChange={(e) => update("batch_name", e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => update("category", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Deadline</Label>
              <Input type="datetime-local" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1" rows={3} />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Production Cost/Unit</Label>
              <Input value={batch.production_cost_per_unit} disabled className="mt-1 bg-muted" />
              {hasFunding && <p className="text-[10px] text-muted-foreground mt-1">Cannot change after funding</p>}
            </div>
            <div>
              <Label>Wholesale Price</Label>
              <Input type="number" value={form.wholesale_price} onChange={(e) => update("wholesale_price", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Retail Price</Label>
              <Input type="number" value={form.retail_price} onChange={(e) => update("retail_price", e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Logistics Cost/Unit</Label>
              <Input type="number" value={form.logistics_cost_per_unit} onChange={(e) => update("logistics_cost_per_unit", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Manufacturer</Label>
              <Input value={form.manufacturer} onChange={(e) => update("manufacturer", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Warehouse</Label>
              <Input value={form.warehouse} onChange={(e) => update("warehouse", e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBatchDialog;
