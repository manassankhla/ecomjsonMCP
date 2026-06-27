"use client";

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

function formatPrice(price: string) {
  const numeric = Number(price);

  if (Number.isFinite(numeric)) {
    return `$${numeric.toFixed(2)}`;
  }

  return price ? `$${price}` : "See price";
}

export default function ProductCard({ product }: { product: Product }) {
  const tags = product.tags.slice(0, 3);
  const price = formatPrice(product.price);
  const productUrl =
    product.productUrl ??
    `https://manas-testing.myshopify.com/products/${product.handle}`;
  const checkoutUrl = product.checkoutUrl ?? productUrl;

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
      <div className="relative bg-white">
        <img
          src={product.image}
          alt={product.title}
          className="aspect-[1.35/1] w-full object-cover"
        />

        <span className="absolute right-2 top-2 rounded-full bg-black/75 px-2 py-1 text-xs font-bold text-white">
          {price}
        </span>
      </div>

      <div className="grid gap-2.5 p-3">
        <div>
          <h2 className="line-clamp-2 min-h-9 text-[15px] font-semibold leading-tight">
            {product.title}
          </h2>
          <p className="mt-1 truncate text-xs text-neutral-400">
            {product.brand}
          </p>
        </div>

        <div className="flex min-h-6 gap-1.5 overflow-hidden">
          {tags.map((tag) => (
            <span
              key={tag}
              className="shrink-0 rounded-md bg-neutral-700 px-2 py-1 text-[11px] text-neutral-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid gap-2 border-t border-white/10 pt-2.5">
          <span className="text-xl font-extrabold">{price}</span>
          <div className="flex gap-1.5">
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-sm font-bold text-white"
            >
              View
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
      </div>
    </article>
  );
}
