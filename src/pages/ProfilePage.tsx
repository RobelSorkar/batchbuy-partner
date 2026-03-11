import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { User, Phone, MapPin, Loader2, Save, ArrowLeft, Camera } from "lucide-react";
import AvatarCropDialog from "@/components/AvatarCropDialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number (e.g. 01XXXXXXXXX)").or(z.literal("")),
  address: z.string().trim().max(300, "Address is too long").or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileFormData>({ full_name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 5MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!user) return;
    setUploadingAvatar(true);

    const ext = "jpg";
    const path = `avatars/${user.id}.${ext}`;
    const file = new File([blob], `avatar.${ext}`, { type: "image/jpeg" });

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      setAvatarUrl(newUrl);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Avatar updated" });
    }
    setUploadingAvatar(false);
    setCropDialogOpen(false);
    setCropSrc(null);
  };

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
          address: data.address || null,
        })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    updateProfile.mutate(result.data);
  };

  const setField = (field: keyof ProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted/50 mb-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="w-20 h-20 border-2 border-border">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Avatar" />
                    ) : null}
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {form.full_name?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingAvatar ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">Click photo to change</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.full_name}
                    onChange={(e) => setField("full_name", e.target.value)}
                    placeholder="Your full name"
                    className={`pl-10 ${errors.full_name ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    placeholder="Your full address"
                    rows={3}
                    className={`pl-10 resize-none ${errors.address ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
