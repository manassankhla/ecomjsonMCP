"use client";

import ProductGrid from "./ProductGrid";
import { useWidgetProps } from "./hook";

type Product = {
  id: string;
  title: string;
  description: string;
  brand: string;
  tags: string[];
  image: string;
  price: string;
  handle: string;
};
export default function WidgetPage() {
  const data = useWidgetProps<{
    structuredContent?: {
      products: Product[];
    };
    _meta?: {
      structuredContent?: {
        products: Product[];
      };
    };
  }>();

  const products =
    data?._meta?.structuredContent?.products ||
    data?.structuredContent?.products ||
    (data as any)?.products;

  if (!products) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="p-8">
      <ProductGrid products={products} />
    </main>
  );
}