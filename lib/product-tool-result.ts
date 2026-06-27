import { productWidgetToolMeta } from "@/lib/mcp-widget-config";
import type { Product } from "@/lib/products";

export function buildProductToolResult(
  products: Product[],
  label: string
) {
  return {
    content: [
      {
        type: "text" as const,
        text: `${label} See the interactive product grid widget below.`,
      },
    ],
    structuredContent: {
      count: products.length,
    },
    _meta: {
      ...productWidgetToolMeta(),
      products,
    },
  };
}
