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
  productUrl: string;
  checkoutUrl: string;
  variantId: string;
};

export default function WidgetPage() {
  const data = useWidgetProps<{
    products?: Product[];
    structuredContent?: {
      products: Product[];
    };
  }>();

  const products = data?.products ?? data?.structuredContent?.products;

  if (!products) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Open this page from ChatGPT after calling search_products.
      </main>
    );
  }

  return (
    <main className="p-8">
      <ProductGrid products={products} />
    </main>
  );
}
