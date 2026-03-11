import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check, RotateCcw } from "lucide-react";

interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  uploading?: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 80 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

const AvatarCropDialog = ({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  uploading = false,
}: AvatarCropDialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const newCrop = centerAspectCrop(naturalWidth, naturalHeight);
    setCrop(newCrop);
    setCompletedCrop(newCrop);
  }, []);

  const handleReset = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const newCrop = centerAspectCrop(naturalWidth, naturalHeight);
      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  };

  const getCroppedBlob = useCallback((): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image || !completedCrop) return Promise.resolve(null);

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.unit === "%" 
      ? (completedCrop.x / 100) * image.naturalWidth 
      : completedCrop.x * scaleX;
    const cropY = completedCrop.unit === "%" 
      ? (completedCrop.y / 100) * image.naturalHeight 
      : completedCrop.y * scaleY;
    const cropW = completedCrop.unit === "%" 
      ? (completedCrop.width / 100) * image.naturalWidth 
      : completedCrop.width * scaleX;
    const cropH = completedCrop.unit === "%" 
      ? (completedCrop.height / 100) * image.naturalHeight 
      : completedCrop.height * scaleY;

    const size = Math.min(cropW, cropH, 512);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return Promise.resolve(null);

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, size, size);

    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9));
  }, [completedCrop]);

  const handleConfirm = async () => {
    const blob = await getCroppedBlob();
    if (blob) onCropComplete(blob);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !uploading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">ছবি ক্রপ করুন</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center max-h-[60vh] overflow-hidden rounded-lg bg-muted/50">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-[55vh]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-[55vh] object-contain"
              />
            </ReactCrop>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={uploading}>
            <RotateCcw className="w-4 h-4 mr-1.5" /> রিসেট
          </Button>
          <div className="flex-1" />
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={uploading}>
            বাতিল
          </Button>
          <Button type="button" size="sm" onClick={handleConfirm} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Check className="w-4 h-4 mr-1.5" />}
            {uploading ? "আপলোড হচ্ছে..." : "সেভ করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCropDialog;
