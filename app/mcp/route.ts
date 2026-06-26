import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";

import { searchProducts } from "@/lib/products";

const server = new McpServer({
  name: "chatgpt-shopify-mcp",
  version: "1.0.0",
});

server.registerTool(
  "search_products",
  {
    title: "Search Products",
    description: "Search products from the local catalog.",
    inputSchema: {
      query: z.string(),
    },
  },
  async ({ query }) => {
    const products = searchProducts(query);

    return {
      content: [
        {
          type: "text",
          text: `Found ${products.length} products.`,
        },
      ],

      structuredContent: {
        products,
      },
    };
  }
);

export async function GET() {
  return Response.json({
    status: "MCP Server Running",
  });
}

export async function POST(req: Request) {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  return transport.handleRequest(req);
}