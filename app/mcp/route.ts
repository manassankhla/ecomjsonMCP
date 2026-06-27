import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  getAppOrigin,
  productWidgetMeta,
  productWidgetResourceMeta,
  PRODUCT_WIDGET_URI,
} from "@/lib/mcp-widget-config";
import { buildProductToolResult } from "@/lib/product-tool-result";
import { createProductWidgetHtml } from "@/lib/product-widget-html";
import { getProducts } from "@/lib/products";

const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  brand: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
  price: z.string(),
  handle: z.string(),
});

const productOutputSchema = z.object({
  products: z.array(productSchema),
});

const handler = createMcpHandler(
  async (server) => {
    const widgetDomain = getAppOrigin();
    const widgetHtml = createProductWidgetHtml();
    const widgetDescription =
      "Interactive product catalog grid with images, prices, and links.";

    server.registerResource(
      "product-widget",
      PRODUCT_WIDGET_URI,
      {
        title: "Product Catalog",
        description: widgetDescription,
        mimeType: "text/html+skybridge",
        _meta: productWidgetResourceMeta(widgetDomain, widgetDescription),
      },
      async () => ({
        contents: [
          {
            uri: PRODUCT_WIDGET_URI,
            mimeType: "text/html+skybridge",
            text: widgetHtml,
            _meta: productWidgetResourceMeta(widgetDomain, widgetDescription),
          },
        ],
      })
    );

    server.registerTool(
      "show_products",
      {
        title: "Show Products",
        description:
          "Show products from the Shopify catalog in an interactive grid widget. Omit query or pass 'all' to list the full catalog. Pass keywords like 'snowboard' to search.",
        inputSchema: z.object({
          query: z
            .string()
            .optional()
            .describe(
              "Optional search keywords. Leave empty or use 'all' / 'all products' to list the entire catalog."
            ),
        }),
        outputSchema: productOutputSchema,
        annotations: {
          readOnlyHint: true,
        },
        _meta: productWidgetMeta(widgetDomain),
      },
      async (args: { query?: string }) => {
        const products = await getProducts(args.query);
        const label =
          !args.query?.trim() || args.query.trim().toLowerCase().includes("all")
            ? `Loaded ${products.length} products from the catalog.`
            : `Found ${products.length} matching products.`;

        return buildProductToolResult(products, widgetDomain, label);
      }
    );
  },
  {
    serverInfo: {
      name: "shopify-product-catalog",
      version: "1.0.0",
    },
    instructions:
      "Always call show_products for product requests. Never list products in markdown tables. The widget renders the catalog automatically.",
  }
);

export const GET = handler;
export const POST = handler;
