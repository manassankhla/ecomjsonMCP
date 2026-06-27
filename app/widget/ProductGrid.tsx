"use client";

import ProductCard from "./ProductCard";

type Product = {
  id: string;
  title: string;
  description: string;
  brand: string;
  tags: string[];
  image: string;
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

  return (
    <section className="rounded-[18px] border border-white/15 bg-neutral-800 p-3 text-white">
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

      <div className="grid auto-cols-[minmax(210px,245px)] grid-flow-col gap-3 overflow-x-auto pb-0.5 [scrollbar-width:none]">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
