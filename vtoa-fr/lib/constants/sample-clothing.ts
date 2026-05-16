import type { ClothingItem } from "@/services/tryon/types";

/**
 * Curated sample garments for the demo gallery.
 * URLs are stable Unsplash assets suitable for try-on previews.
 * Replace with merchant catalog data when embedding in Shopify.
 */
export const SAMPLE_CLOTHING_ITEMS: ClothingItem[] = [
  {
    id: "tee-minimal",
    name: "Minimal Tee",
    category: "Tops",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "jacket-denim",
    name: "Denim Jacket",
    category: "Outerwear",
    imageUrl:
      "https://images.unsplash.com/photo-1576995853121-7a13d83bbd7f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "hoodie-street",
    name: "Street Hoodie",
    category: "Tops",
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63d956f768?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "dress-summer",
    name: "Summer Dress",
    category: "Dresses",
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "blazer-classic",
    name: "Classic Blazer",
    category: "Outerwear",
    imageUrl:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "knit-sweater",
    name: "Knit Sweater",
    category: "Tops",
    imageUrl:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80",
  },
];
