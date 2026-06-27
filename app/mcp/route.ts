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
import { listAllProducts, searchProducts } from "@/lib/products";

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

const widgetToolMeta = (widgetDomain: string) => ({
  ...productWidgetMeta(widgetDomain),
  "openai/resultCanProduceWidget": true as const,
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
      "list_all_products",
      {
        title: "List All Products",
        description:
          "Use this when the user asks to show all products, browse the catalog, or see everything in the store. Always call this tool for those requests. Results render in the product grid widget.",
        inputSchema: z.object({}),
        outputSchema: productOutputSchema,
        annotations: {
          readOnlyHint: true,
        },
        _meta: widgetToolMeta(widgetDomain),
      },
      async () => {
        const products = await listAllProducts();

        return buildProductToolResult(
          products,
          widgetDomain,
          widgetHtml,
          `Loaded ${products.length} products.`
        );
      }
    );

    server.registerTool(
      "search_products",
      {
        title: "Search Products",
        description:
          "Use this when the user asks to search or filter products by keyword, brand, or category. Results render in the product grid widget.",
        inputSchema: z.object({
          query: z
            .string()
            .describe("Search keywords such as snowboard, gift card, or jacket"),
        }),
        outputSchema: productOutputSchema,
        annotations: {
          readOnlyHint: true,
        },
        _meta: widgetToolMeta(widgetDomain),
      },
      async (args: { query: string }) => {
        const products = await searchProducts(args.query);

        return buildProductToolResult(
          products,
          widgetDomain,
          widgetHtml,
          `Found ${products.length} matching products.`
        );
      }
    );
  },
  {
    serverInfo: {
      name: "shopify-product-catalog",
      version: "1.0.0",
    },
    instructions:
      "For product browsing, always call list_all_products or search_products. Never answer with markdown tables or bullet lists of products. The interactive widget displays products with images and prices.",
  }
);

export const GET = handler;
export const POST = handler;
