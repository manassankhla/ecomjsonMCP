"use client";

import ProductCard from "./ProductCard";

type Product = {
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

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <section className="rounded-[18px] border border-white/15 bg-neutral-800 p-6 text-center text-white">
        <h2 className="text-xl font-semibold">No Products Found</h2>
        <p className="mt-2 text-neutral-400">Try another search.</p>
      </section>
    );
  }

  if (products.length === 1) {
    const product = products[0];
    const images = Array.from(
      new Set([product.image, ...product.images].filter(Boolean))
    ).slice(0, 3);
    const price = Number.isFinite(Number(product.price))
      ? `$${Number(product.price).toFixed(2)}`
      : product.price
        ? `$${product.price}`
        : "See price";
    const productUrl =
      product.productUrl ??
      `https://manas-testing.myshopify.com/products/${product.handle}`;
    const checkoutUrl = product.checkoutUrl ?? productUrl;

    return (
      <section className="grid gap-3 rounded-2xl bg-neutral-900 p-3 text-white md:grid-cols-[minmax(0,1fr)_minmax(230px,0.78fr)]">
        <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2.5">
          {images[0] ? (
            <img
              src={images[0]}
              alt={product.title}
              className="aspect-[1.22/1] w-full rounded-[14px] bg-white object-cover"
            />
          ) : (
            <div className="aspect-[1.22/1] rounded-[14px] bg-white" />
          )}

          <div className="grid gap-2.5">
            {images.slice(1, 3).map((image) => (
              <img
                key={image}
                src={image}
                alt={product.title}
                className="aspect-square w-full rounded-[10px] bg-white object-cover"
              />
            ))}
          </div>
        </div>

        <div className="grid content-center gap-3">
          <div>
            <p className="mb-1 text-xs font-semibold text-neutral-400">
              {product.brand}
            </p>
            <h1 className="text-2xl font-bold leading-tight">
              {product.title}
            </h1>
          </div>

          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-300">
            {product.description || "No description is available for this product."}
          </p>

          <div className="flex gap-1.5 overflow-hidden">
            {product.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="shrink-0 rounded-md bg-neutral-700 px-2 py-1 text-[11px]"
              >
                {tag}
              </span>
            ))}
          </div>

          <span className="text-xl font-extrabold">{price}</span>

          <div className="flex gap-2">
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-sm font-bold text-white"
            >
              View product
            </a>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-white px-3 py-2 text-center text-sm font-bold text-neutral-900"
            >
              Checkout
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-neutral-900 p-2.5 text-white">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="mb-0.5 text-xs font-semibold text-neutral-400">
            Shopify catalog
          </p>
          <h1 className="text-[17px] font-bold leading-tight">
            Featured products
          </h1>
        </div>
      </div>

      <div className="grid auto-cols-[minmax(240px,276px)] grid-flow-col gap-3 overflow-x-auto pb-0.5 [scrollbar-width:none]">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
