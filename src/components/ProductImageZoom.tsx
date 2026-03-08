import { useState } from "react";
import { X } from "lucide-react";
import { getProductImage } from "@/utils/productImages";

interface ProductImageZoomProps {
  productName: string;
  fallbackEmoji?: string;
}

const ProductImageZoom = ({ productName, fallbackEmoji = "📦" }: ProductImageZoomProps) => {
  const [zoomed, setZoomed] = useState(false);
  const imageSrc = getProductImage(productName);

  return (
    <>
      <div
        className={`h-64 bg-muted/50 rounded-xl flex items-center justify-center overflow-hidden ${imageSrc ? "cursor-zoom-in" : ""}`}
        onClick={() => imageSrc && setZoomed(true)}
      >
        {imageSrc ? (
          <img src={imageSrc} alt={productName} className="w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-105" />
        ) : (
          <span className="text-7xl">{fallbackEmoji}</span>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imageSrc!}
            alt={productName}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </>
  );
};

export default ProductImageZoom;
