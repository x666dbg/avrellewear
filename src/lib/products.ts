import raw from "@/data/products.json";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
};

export const allProducts = raw as Product[];

export function getActiveProducts(): Product[] {
  return allProducts.filter(p => p.status === "ACTIVE");
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find(p => p.slug === slug && p.status === "ACTIVE");
}

export function getAllSlugs(): string[] {
  return getActiveProducts().map(p => p.slug);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(getActiveProducts().map(p => p.category)));
}
