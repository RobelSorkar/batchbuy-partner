import casualSneakers from "@/assets/products/casual-sneakers.jpg";
import leatherSandals from "@/assets/products/leather-sandals.jpg";
import leatherWallet from "@/assets/products/leather-wallet.jpg";
import cottonPanjabi from "@/assets/products/cotton-panjabi.jpg";
import wirelessEarbuds from "@/assets/products/wireless-earbuds.jpg";
import kitchenContainers from "@/assets/products/kitchen-containers.jpg";

const productImageMap: Record<string, string> = {
  "casual sneakers": casualSneakers,
  "leather sandals": leatherSandals,
  "handcrafted leather wallet": leatherWallet,
  "cotton panjabi": cottonPanjabi,
  "wireless earbuds pro": wirelessEarbuds,
  "kitchen storage containers": kitchenContainers,
};

export function getProductImage(productName: string): string | null {
  const key = productName.toLowerCase();
  return productImageMap[key] || null;
}
