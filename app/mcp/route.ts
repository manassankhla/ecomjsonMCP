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
import {
  getFeaturedProducts,
  getProductForCheckout,
  getProducts,
  getProductsByTag,
  getProductsUnderPrice,
  getRecommendedProducts,
  isCatalogWideQuery,
} from "@/lib/products";

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

const optionalSeedSchema = z.object({
  seed: z
    .string()
    .optional()
    .describe("Optional product name, handle, or theme to recommend similar products from."),
});

const priceFilterSchema = z.object({
  maxPrice: z
    .number()
    .positive()
    .describe("Maximum product price in USD, such as 500 or 1000."),
});

const productOutputSchema = z.object({
  count: z.number(),
  label: z.string(),
  products: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      brand: z.string(),
      tags: z.array(z.string()),
      image: z.string(),
      images: z.array(z.string()),
      price: z.string(),
      handle: z.string(),
      productUrl: z.string(),
      checkoutUrl: z.string(),
      variantId: z.string(),
    })
  ),
});

async function runProductTool(query?: string) {
  const products = await getProducts(query);
  const label = isCatalogWideQuery(query)
    ? `Loaded ${products.length} products from the catalog.`
    : `Showing ${products.length} products for ${query}.`;

  return { products, label };
}

async function runCheckoutTool(query: string) {
  const product = await getProductForCheckout(query);
  const products = product ? [product] : [];
  const label = product
    ? `Ready to checkout: ${product.title}.`
    : `No checkout product found for ${query}.`;

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

    registerProductTool(
      "featured_products",
      "Featured Products",
      "Show a polished carousel of featured Shopify products with product and checkout actions.",
      z.object({}),
      async () => {
        const products = await getFeaturedProducts();
        return {
          products,
          label: `Showing ${products.length} featured products.`,
        };
      }
    );

    registerProductTool(
      "products_under_price",
      "Products Under Price",
      "Show products under a maximum price in a carousel with checkout actions.",
      priceFilterSchema,
      async (args) => {
        const maxPrice = Number(args.maxPrice);
        const products = await getProductsUnderPrice(maxPrice);
        return {
          products,
          label: `Showing ${products.length} products under $${maxPrice}.`,
        };
      }
    );

    registerProductTool(
      "winter_sports_products",
      "Winter Sports Products",
      "Show winter or sports products from the catalog in a rich carousel.",
      z.object({}),
      async () => {
        const products = await getProductsByTag("Winter");
        return {
          products,
          label: `Showing ${products.length} winter sports products.`,
        };
      }
    );

    registerProductTool(
      "recommend_products",
      "Recommend Products",
      "Recommend related Shopify products from a product name, handle, or shopping theme.",
      optionalSeedSchema,
      async (args) => {
        const seed = args.seed as string | undefined;
        const products = await getRecommendedProducts(seed);
        return {
          products,
          label: seed
            ? `Showing ${products.length} recommendations for ${seed}.`
            : `Showing ${products.length} recommended products.`,
        };
      }
    );

    registerProductTool(
      "create_checkout_link",
      "Create Checkout Link",
      "Find a Shopify product and show a checkout-ready card with a direct cart checkout action.",
      requiredQuerySchema,
      async (args) => runCheckoutTool(args.query as string)
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
