import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { searchProducts } from "@/lib/products";

// Function to fetch the widget HTML
const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  // Fetch HTML from our widget route
  const html = await getAppsSdkCompatibleHtml("https://ecomjson-mcp.vercel.app", "/widget");

  const contentWidget: ContentWidget = {
    id: "search_products",
    title: "Search Products",
    templateUri: "ui://widget/product-search.html",
    invoking: "Searching products...",
    invoked: "Products found",
    html: html,
    description: "Displays a product search grid",
    widgetDomain: "https://ecomjson-mcp.vercel.app", 
  };

  server.registerResource(
    "product-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri: any) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // @ts-ignore
  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description: "Search products from the local catalog.",
      inputSchema: z.object({
        query: z.string(),
      }),
      _meta: widgetMeta(contentWidget),
    },
    async (args: any) => {
      const { query } = args;
      const products = searchProducts(query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(products, null, 2),
          },
        ],
        structuredContent: {
          products,
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );
});

export const GET = handler;
export const POST = handler;
