import {
  productWidgetMeta,
  PRODUCT_WIDGET_URI,
} from "@/lib/mcp-widget-config";
import type { Product } from "@/lib/products";

export function buildProductToolResult(
  products: Product[],
  widgetDomain: string,
  widgetHtml: string,
  label: string
) {
  return {
    content: [
      {
        type: "text" as const,
        text: `${label} Open the product grid widget below instead of listing products in a table.`,
      },
      {
        type: "resource" as const,
        resource: {
          uri: PRODUCT_WIDGET_URI,
          mimeType: "text/html+skybridge",
          text: widgetHtml,
        },
      },
    ],
    structuredContent: {
      products,
    },
    _meta: productWidgetMeta(widgetDomain),
  };
}
