import { shopifyFetch } from "./shopify";

export type Product = {
  id: string;
  title: string;
  description: string;
  brand: string;
  tags: string[];
  image: string;
  price: string;
  handle: string;
};

const PRODUCT_FIELDS = `
  id
  title
  description
  vendor
  tags
  handle
  featuredImage {
    url
  }
  variants(first: 1) {
    edges {
      node {
        price
      }
    }
  }
`;

function mapProduct(node: {
  id: string;
  title: string;
  description: string;
  vendor: string;
  tags: string[];
  handle: string;
  featuredImage?: { url?: string | null } | null;
  variants: { edges: Array<{ node: { price: string } }> };
}): Product {
  return {
    id: node.id,
    title: node.title,
    description: node.description,
    brand: node.vendor,
    tags: node.tags,
    image: node.featuredImage?.url ?? "",
    price: node.variants.edges[0]?.node.price ?? "",
    handle: node.handle,
  };
}

export async function listAllProducts(limit = 50): Promise<Product[]> {
  const { data } = await shopifyFetch(
    `
      query ListProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              ${PRODUCT_FIELDS}
            }
          }
        }
      }
    `,
    { first: limit }
  );

  return data.products.edges.map(({ node }: { node: Parameters<typeof mapProduct>[0] }) =>
    mapProduct(node)
  );
}

export async function searchProducts(search: string, limit = 50): Promise<Product[]> {
  const { data } = await shopifyFetch(
    `
      query SearchProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          edges {
            node {
              ${PRODUCT_FIELDS}
            }
          }
        }
      }
    `,
    {
      query: search,
      first: limit,
    }
  );

  return data.products.edges.map(({ node }: { node: Parameters<typeof mapProduct>[0] }) =>
    mapProduct(node)
  );
}

const CATALOG_WIDE_QUERIES = new Set([
  "all",
  "*",
  "all products",
  "show all",
  "show all products",
  "everything",
  "catalog",
  "full catalog",
  "entire catalog",
  "list all",
  "list all products",
  "browse catalog",
  "browse all",
]);

export function isCatalogWideQuery(query?: string): boolean {
  if (!query?.trim()) {
    return true;
  }

  const normalized = query.trim().toLowerCase();

  if (CATALOG_WIDE_QUERIES.has(normalized)) {
    return true;
  }

  return /^(show|list|get|display)\s+(me\s+)?(all|every)\s+(products?|items?|catalog)/.test(
    normalized
  );
}

export async function getProducts(query?: string): Promise<Product[]> {
  if (isCatalogWideQuery(query)) {
    return listAllProducts();
  }

  return searchProducts(query!.trim());
}
