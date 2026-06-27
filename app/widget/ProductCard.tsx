"use client";

type Product = {
  id: string;
  title: string;
  description: string;
  brand: string;
  tags: string[];
  image: string;
  price: string;
  handle: string;
};

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <img
        src={product.image}
        alt={product.title}
        className="h-56 w-full object-cover"
      />

      <div className="space-y-3 p-5">
        <div>
          <h2 className="line-clamp-2 text-lg font-semibold">
            {product.title}
          </h2>

          <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          {/* <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
            ⭐ {product.rating}
          </span> */}

          <span className="text-xl font-bold">
             ${product.price}
          </span>
        </div>

       <a
  href={`https://manas-testing.myshopify.com/products/${product.handle}`}
  target="_blank"
  rel="noopener noreferrer"
  className="block rounded-xl bg-black py-3 text-center font-medium text-white"
>
          View Product
        </a>
      </div>
    </div>
  );
}