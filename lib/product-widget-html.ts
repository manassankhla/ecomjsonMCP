const SHOPIFY_STORE = "manas-testing.myshopify.com";

export function createProductWidgetHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #fafafa;
      color: #171717;
    }
    main { padding: 16px; }
    .grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
    .card {
      overflow: hidden;
      border-radius: 16px;
      border: 1px solid #e5e5e5;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,.05);
    }
    .card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
      background: #f5f5f5;
    }
    .card-body { padding: 16px; }
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .desc {
      margin: 8px 0 0;
      font-size: 13px;
      color: #737373;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .price {
      display: block;
      margin-top: 12px;
      font-size: 18px;
      font-weight: 700;
    }
    .btn {
      display: block;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #000;
      color: #fff;
      text-align: center;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    .empty, .loading {
      padding: 32px 16px;
      text-align: center;
      color: #737373;
    }
  </style>
</head>
<body>
  <main id="root"><div class="loading">Loading products…</div></main>
  <script type="module">
    const STORE = ${JSON.stringify(SHOPIFY_STORE)};
    const root = document.getElementById("root");

    function getProducts() {
      const output = window.openai?.toolOutput;
      if (Array.isArray(output?.products)) {
        return output.products;
      }

      const metadata = window.openai?.toolResponseMetadata;
      if (Array.isArray(metadata?.products)) {
        return metadata.products;
      }
      if (Array.isArray(metadata?._meta?.products)) {
        return metadata._meta.products;
      }

      return [];
    }

    function hasToolData() {
      return Boolean(
        window.openai?.toolOutput ||
          window.openai?.toolResponseMetadata ||
          getProducts().length
      );
    }

    function escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    }

    function render() {
      const products = getProducts();

      if (!hasToolData()) {
        root.innerHTML = '<div class="loading">Loading products…</div>';
        return;
      }

      if (!products.length) {
        root.innerHTML =
          '<div class="empty"><strong>No products found</strong><p>Try another search.</p></div>';
        return;
      }

      root.innerHTML =
        '<div class="grid">' +
        products
          .map((product) => {
            const href =
              "https://" +
              STORE +
              "/products/" +
              encodeURIComponent(product.handle || "");
            return (
              '<article class="card">' +
              (product.image
                ? '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.title) + '" />'
                : "") +
              '<div class="card-body">' +
              '<h2 class="title">' + escapeHtml(product.title) + "</h2>" +
              (product.description
                ? '<p class="desc">' + escapeHtml(product.description) + "</p>"
                : "") +
              '<span class="price">$' + escapeHtml(product.price) + "</span>" +
              '<a class="btn" href="' + href + '" target="_blank" rel="noopener noreferrer">View Product</a>' +
              "</div></article>"
            );
          })
          .join("") +
        "</div>";

      window.openai?.notifyIntrinsicHeight?.(document.body.scrollHeight);
    }

    window.addEventListener("openai:set_globals", render);
    render();
  </script>
</body>
</html>`;
}
