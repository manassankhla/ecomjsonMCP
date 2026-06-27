import { productWidgetMeta } from "@/lib/mcp-widget-config";
import type { Product } from "@/lib/products";

export function buildProductToolResult(
  products: Product[],
  widgetDomain: string,
  label: string
) {
  return {
    content: [
      {
        type: "text" as const,
        text: `${label} Products are shown in the interactive grid widget below.`,
      },
    ],
    structuredContent: {
      products,
    },
    _meta: productWidgetMeta(widgetDomain),
  };
}
