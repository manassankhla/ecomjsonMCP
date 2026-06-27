import { shopifyFetch } from "./shopify";

export async function searchProducts(search: string) {
  const { data } = await shopifyFetch(
    `
      query SearchProducts($query: String!) {
        products(first: 20, query: $query) {
          edges {
            node {
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
            }
          }
        }
      }
    `,
    {
     query: search,
    }
  );

  return data.products.edges.map(({ node }: any) => ({
    id: node.id,
    title: node.title,
    description: node.description,
    brand: node.vendor,
    tags: node.tags,
    image: node.featuredImage?.url ?? "",
    price: node.variants.edges[0]?.node.price ?? "",
    handle: node.handle,
  }));
}