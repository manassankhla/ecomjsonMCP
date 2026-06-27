import { shopifyFetch } from "./shopify";

export type Product = {
  id: string;
  title: string;
  description: string;
  brand: string;
  tags: string[];
  image: string;
  images: string[];
  price: string;
  handle: string;
  productUrl: string;
  checkoutUrl: string;
  variantId: string;
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
  images(first: 3) {
    edges {
      node {
        url
      }
    }
  }
  variants(first: 1) {
    edges {
      node {
        id
        price
      }
    }
  }
`;

function getShopifyStoreDomain() {
  return process.env.SHOPIFY_STORE_DOMAIN ?? "manas-testing.myshopify.com";
}

function getNumericId(gid?: string) {
  return gid?.split("/").at(-1) ?? "";
}

function mapProduct(node: {
  id: string;
  title: string;
  description: string;
  vendor: string;
  tags: string[];
  handle: string;
  featuredImage?: { url?: string | null } | null;
  images?: { edges: Array<{ node: { url?: string | null } }> };
  variants: { edges: Array<{ node: { id: string; price: string } }> };
}): Product {
  const storeDomain = getShopifyStoreDomain();
  const variantId = getNumericId(node.variants.edges[0]?.node.id);
  const productUrl = `https://${storeDomain}/products/${node.handle}`;
  const images = [
    ...(node.featuredImage?.url ? [node.featuredImage.url] : []),
    ...(node.images?.edges.map(({ node: image }) => image.url).filter(Boolean) ?? []),
  ].filter((image, index, allImages) => allImages.indexOf(image) === index) as string[];

  return {
    id: node.id,
    title: node.title,
    description: node.description,
    brand: node.vendor,
    tags: node.tags,
    image: images[0] ?? "",
    images,
    price: node.variants.edges[0]?.node.price ?? "",
    handle: node.handle,
    productUrl,
    checkoutUrl: variantId
      ? `https://${storeDomain}/cart/${variantId}:1?storefront=true`
      : productUrl,
    variantId,
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

  const matches = await searchProducts(query!.trim());

  if (matches.length === 1) {
    return matches;
  }

  if (matches.length >= 4) {
    return matches;
  }

  const catalog = await listAllProducts();
  const productsById = new Map<string, Product>();

  for (const product of [...matches, ...catalog]) {
    productsById.set(product.id, product);
  }

  return Array.from(productsById.values()).slice(0, 4);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return listAllProducts(limit);
}

export async function getProductsUnderPrice(maxPrice: number): Promise<Product[]> {
  const products = await listAllProducts();

  return products
    .filter((product) => Number(product.price) <= maxPrice)
    .slice(0, 8);
}

export async function getProductsByTag(tag: string): Promise<Product[]> {
  const normalizedTag = tag.trim().toLowerCase();
  const products = await listAllProducts();

  return products
    .filter((product) =>
      product.tags.some((productTag) => productTag.toLowerCase() === normalizedTag)
    )
    .slice(0, 8);
}

export async function getRecommendedProducts(seed?: string): Promise<Product[]> {
  if (!seed?.trim()) {
    return getFeaturedProducts(8);
  }

  const products = await getProducts(seed);
  const seedProduct = products[0];

  if (!seedProduct?.tags.length) {
    return products.slice(0, 8);
  }

  const catalog = await listAllProducts();
  const seedTags = new Set(seedProduct.tags.map((tag) => tag.toLowerCase()));

  return catalog
    .filter((product) => product.id !== seedProduct.id)
    .sort((left, right) => {
      const leftScore = left.tags.filter((tag) => seedTags.has(tag.toLowerCase())).length;
      const rightScore = right.tags.filter((tag) => seedTags.has(tag.toLowerCase())).length;

      return rightScore - leftScore;
    })
    .slice(0, 8);
}

export async function getProductForCheckout(query: string): Promise<Product | undefined> {
  const products = await getProducts(query);

  return products[0];
}
