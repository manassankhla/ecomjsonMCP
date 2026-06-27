export const PRODUCT_WIDGET_URI = "ui://widget/product-catalog-v5.html";

// ChatGPT enables the UI bridge for this MIME type.
export const WIDGET_MIME_TYPE = "text/html;profile=mcp-app";

export function getAppOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function productWidgetToolMeta() {
  return {
    ui: {
      resourceUri: PRODUCT_WIDGET_URI,
    },
    "openai/outputTemplate": PRODUCT_WIDGET_URI,
    "openai/toolInvocation/invoking": "Loading products...",
    "openai/toolInvocation/invoked": "Products ready",
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
  } as const;
}

export function productWidgetResourceMeta(widgetDomain: string, description: string) {
  return {
    ui: {
      prefersBorder: true,
      domain: widgetDomain,
      csp: {
        connectDomains: [widgetDomain],
        resourceDomains: [
          widgetDomain,
          "https://cdn.shopify.com",
          "https://*.myshopify.com",
        ],
      },
    },
    "openai/widgetDescription": description,
    "openai/widgetPrefersBorder": true,
    "openai/widgetDomain": widgetDomain,
    "openai/widgetCSP": {
      connect_domains: [widgetDomain],
      resource_domains: [
        widgetDomain,
        "https://cdn.shopify.com",
        "https://*.myshopify.com",
      ],
      redirect_domains: ["https://manas-testing.myshopify.com"],
    },
  } as const;
}
