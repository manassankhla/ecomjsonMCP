
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";

import { searchProducts } from "@/lib/products";

/**
 * Create a fresh MCP server for each request.
 * This avoids:
 * "Already connected to a transport"
 */
function createServer() {
  const server = new McpServer({
    name: "chatgpt-shopify-mcp",
    version: "1.0.0",
  });

  server.tool(
    "search_products",
    "Search products from the local catalog.",
    {
      query: z.string(),
    },
    async ({ query }) => {
      const products = searchProducts(query);

      return {
        content: [
          {
            type: "text",
            text: `Found ${products.length} product(s).`,
          },
        ],
        _meta: {
          ui: {
            resourceUri: "https://ecomjson-mcp.vercel.app/widget",
          },
        },
      };
    }
  );

  return server;
}

export async function POST(req: Request) {
  const server = createServer();

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  return await transport.handleRequest(req);
}
