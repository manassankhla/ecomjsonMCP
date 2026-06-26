import products from '@/data/products.json';

export function searchProducts(query:string) {
    const q = query.toLowerCase();

    return products.filter((product) => 
       product.title.toLowerCase().includes(q) ||
       product.description.toLowerCase().includes(q) ||
       product.brand.toLowerCase().includes(q) ||
       product.tags.some((tag) => tag.toLowerCase().includes(q))
    );
}