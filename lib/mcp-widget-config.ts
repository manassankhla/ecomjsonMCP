export const PRODUCT_WIDGET_URI = "ui://shopify-product-catalog/product-widget.html";
export const WIDGET_MIME_TYPE = "text/html;profile=mcp-app";

export function getAppOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!configuredOrigin) {
    return "http://localhost:3000";
  }

  const origin = configuredOrigin.startsWith("http")
    ? configuredOrigin
    : `https://${configuredOrigin}`;

  return origin.replace(/\/$/, "");
}

export function productWidgetToolMeta() {
  return {
    ui: {
      resourceUri: PRODUCT_WIDGET_URI,
      visibility: ["model", "app"],
    },
    "openai/outputTemplate": PRODUCT_WIDGET_URI,
    "openai/widgetAccessible": true,
    "openai/toolInvocation/invoking": "Loading products",
    "openai/toolInvocation/invoked": "Products loaded",
  };
}

export function productWidgetResourceMeta(widgetDomain: string, description: string) {
  return {
    ui: {
      prefersBorder: true,
      domain: widgetDomain,
      csp: {
        connectDomains: [widgetDomain, "https://*.myshopify.com"],
        resourceDomains: [
          widgetDomain,
          "https://cdn.shopify.com",
          "https://*.shopify.com",
          "https://*.myshopify.com",
        ],
      },
    },
    "openai/widgetDescription": description,
    "openai/widgetDomain": widgetDomain,
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": {
      connect_domains: [widgetDomain, "https://*.myshopify.com"],
      resource_domains: [
        widgetDomain,
        "https://cdn.shopify.com",
        "https://*.shopify.com",
        "https://*.myshopify.com",
      ],
      redirect_domains: ["https://manas-testing.myshopify.com"],
    },
  };
}
