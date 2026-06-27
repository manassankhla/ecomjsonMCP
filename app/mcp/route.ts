import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  getAppOrigin,
  productWidgetResourceMeta,
  productWidgetToolMeta,
  PRODUCT_WIDGET_URI,
  WIDGET_MIME_TYPE,
} from "@/lib/mcp-widget-config";
import { buildProductToolResult } from "@/lib/product-tool-result";
import { createProductWidgetHtml } from "@/lib/product-widget-html";
import { getProducts, isCatalogWideQuery } from "@/lib/products";

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

const productOutputSchema = z.object({
  count: z.number(),
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
    const widgetMeta = productWidgetToolMeta();
    const resourceMeta = productWidgetResourceMeta(widgetDomain, widgetDescription);

    server.registerResource(
      "product-widget",
      PRODUCT_WIDGET_URI,
      {
        title: "Product Catalog",
        description: widgetDescription,
        mimeType: WIDGET_MIME_TYPE,
        _meta: resourceMeta,
      },
      async () => ({
        contents: [
          {
            uri: PRODUCT_WIDGET_URI,
            mimeType: WIDGET_MIME_TYPE,
            text: widgetHtml,
            _meta: resourceMeta,
          },
        ],
      })
    );

    const registerProductTool = (
      name: string,
      title: string,
      description: string,
      inputSchema: z.ZodObject<z.ZodRawShape>,
      handlerFn: (args: Record<string, unknown>) => Promise<{ products: Awaited<ReturnType<typeof getProducts>>; label: string }>
    ) => {
      server.registerTool(
        name,
        {
          title,
          description,
          inputSchema,
          outputSchema: productOutputSchema,
          annotations: {
            readOnlyHint: true,
          },
          _meta: widgetMeta,
        },
        async (args) => {
          const { products, label } = await handlerFn(args);
          return buildProductToolResult(products, label);
        }
      );
    };

    registerProductTool(
      "search_products",
      "Search Products",
      "Search or browse the Shopify catalog in an interactive grid widget. Use query 'all' or 'all products' to list everything.",
      requiredQuerySchema,
      async (args) => runProductTool(args.query as string)
    );

    registerProductTool(
      "list_all_products",
      "List All Products",
      "List the full Shopify catalog in an interactive grid widget. Use when the user asks to show all products.",
      z.object({}),
      async () => runProductTool()
    );

    registerProductTool(
      "show_products",
      "Show Products",
      "Show products from the Shopify catalog in an interactive grid widget. Omit query or pass 'all' to list the full catalog.",
      optionalQuerySchema,
      async (args) => runProductTool(args.query as string | undefined)
    );
  },
  {
    serverInfo: {
      name: "shopify-product-catalog",
      version: "1.0.0",
    },
    instructions:
      "Always call a product tool for catalog requests. Do not list products in markdown tables. The widget shows the catalog.",
  }
);

export const GET = handler;
export const POST = handler;
