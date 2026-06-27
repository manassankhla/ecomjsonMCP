import type { Product } from "./products";

export function buildProductToolResult(products: Product[], label: string) {
  const structuredContent = {
    count: products.length,
    label,
    products,
  };

  return {
    content: [
      {
        type: "text" as const,
        text: label,
      },
    ],
    structuredContent,
    _meta: {
      products,
    },
  };
}
