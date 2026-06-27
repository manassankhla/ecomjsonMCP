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
import { getProducts, isCatalogWideQuery } from "@/lib/products";

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

const optionalQuerySchema = z.object({
  query: z
    .string()
    .optional()
    .describe(
      "Optional search keywords. Leave empty or use 'all' / 'all products' to list the entire catalog."
    ),
});

const requiredQuerySchema = z.object({
  query: z
    .string()
    .describe(
      "Search keywords such as snowboard or gift card. Use 'all' or 'all products' to list the full catalog."
    ),
});

async function runProductTool(query?: string) {
  const products = await getProducts(query);
  const label = isCatalogWideQuery(query)
    ? `Loaded ${products.length} products from the catalog.`
    : `Found ${products.length} matching products.`;

  return { products, label };
}

const handler = createMcpHandler(
  async (server) => {
    const widgetDomain = getAppOrigin();
    const widgetHtml = createProductWidgetHtml();
    const widgetDescription =
      "Interactive product catalog grid with images, prices, and links.";
    const widgetMeta = productWidgetMeta(widgetDomain);

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
      "search_products",
      {
        title: "Search Products",
        description:
          "Search or browse the Shopify catalog in an interactive grid widget. Use query 'all' or 'all products' to list everything.",
        inputSchema: requiredQuerySchema,
        outputSchema: productOutputSchema,
        annotations: {
          readOnlyHint: true,
        },
        _meta: widgetMeta,
      },
      async (args: { query: string }) => {
        const { products, label } = await runProductTool(args.query);
        return buildProductToolResult(products, widgetDomain, label);
      }
    );

    server.registerTool(
      "list_all_products",
      {
        title: "List All Products",
        description:
          "List the full Shopify catalog in an interactive grid widget. Use when the user asks to show all products.",
        inputSchema: z.object({}),
        outputSchema: productOutputSchema,
        annotations: {
          readOnlyHint: true,
        },
        _meta: widgetMeta,
      },
      async () => {
        const { products, label } = await runProductTool();
        return buildProductToolResult(products, widgetDomain, label);
      }
    );

    server.registerTool(
      "show_products",
      {
        title: "Show Products",
        description:
          "Show products from the Shopify catalog in an interactive grid widget. Omit query or pass 'all' to list the full catalog.",
        inputSchema: optionalQuerySchema,
        outputSchema: productOutputSchema,
        annotations: {
          readOnlyHint: true,
        },
        _meta: widgetMeta,
      },
      async (args: { query?: string }) => {
        const { products, label } = await runProductTool(args.query);
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
      "Use search_products, list_all_products, or show_products for product requests. Never list products in markdown tables. The widget renders the catalog automatically.",
  }
);

export const GET = handler;
export const POST = handler;
