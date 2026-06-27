export const PRODUCT_WIDGET_URI = "ui://widget/product-catalog-v4.html";

export function getAppOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function productWidgetMeta(widgetDomain: string) {
  return {
    ui: {
      resourceUri: PRODUCT_WIDGET_URI,
    },
    "openai/outputTemplate": PRODUCT_WIDGET_URI,
    "openai/toolInvocation/invoking": "Searching products...",
    "openai/toolInvocation/invoked": "Products found",
    "openai/widgetAccessible": true,
    "openai/resultCanProduceWidget": true,
    "openai/widgetDomain": widgetDomain,
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
