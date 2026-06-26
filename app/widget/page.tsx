"use client";

import ProductGrid from "./ProductGrid";
import { useWidgetProps } from "./hook";

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  image: string;
  url: string;
};

export default function WidgetPage() {
  const data = useWidgetProps<{
    structuredContent: {
      products: Product[];
    };
  }>();

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="p-8">
      <ProductGrid products={data.structuredContent.products} />
    </main>
  );
}