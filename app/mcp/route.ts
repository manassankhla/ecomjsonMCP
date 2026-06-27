import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  getAppOrigin,
  productWidgetMeta,
  productWidgetResourceMeta,
  PRODUCT_WIDGET_URI,
} from "@/lib/mcp-widget-config";
import { createProductWidgetHtml } from "@/lib/product-widget-html";
import { searchProducts } from "@/lib/products";

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

const handler = createMcpHandler(async (server) => {
  const widgetDomain = getAppOrigin();
  const widgetHtml = createProductWidgetHtml();
  const widgetDescription = "Displays a product search grid";

  server.registerResource(
    "product-widget",
    PRODUCT_WIDGET_URI,
    {
      title: "Search Products",
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
    "search_products",
    {
      title: "Search Products",
      description: "Search products from the Shopify catalog.",
      inputSchema: z.object({
        query: z.string().describe("Product search query"),
      }),
      outputSchema: z.object({
        products: z.array(productSchema),
      }),
      _meta: productWidgetMeta(widgetDomain),
    },
    async (args: { query: string }) => {
      const { query } = args;
      const products = await searchProducts(query);

      return {
        content: [
          {
            type: "text",
            text: `Found ${products.length} product(s).`,
          },
        ],
        structuredContent: {
          products,
        },
        _meta: productWidgetMeta(widgetDomain),
      };
    }
  );
});

export const GET = handler;
export const POST = handler;
