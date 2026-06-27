export function createProductWidgetHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color-scheme: light dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        margin: 0;
        background: Canvas;
        color: CanvasText;
      }

      main {
        padding: 20px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }

      .card {
        overflow: hidden;
        border: 1px solid color-mix(in srgb, CanvasText 14%, transparent);
        border-radius: 8px;
        background: Canvas;
      }

      .image {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        background: color-mix(in srgb, CanvasText 8%, transparent);
        display: block;
      }

      .content {
        display: grid;
        gap: 10px;
        padding: 14px;
      }

      h2 {
        margin: 0;
        font-size: 16px;
        line-height: 1.3;
      }

      p {
        margin: 0;
        color: color-mix(in srgb, CanvasText 68%, transparent);
        font-size: 13px;
        line-height: 1.4;
      }

      .meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .price {
        font-weight: 700;
      }

      a {
        border-radius: 6px;
        background: CanvasText;
        color: Canvas;
        display: block;
        font-weight: 650;
        padding: 10px 12px;
        text-align: center;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main id="root"></main>
    <script>
      const root = document.getElementById("root");

      function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char]);
      }

      function getProducts() {
        const openai = window.openai ?? {};
        const sources = [
          openai.toolOutput,
          openai.widgetData,
          openai.structuredContent,
          openai.toolResponse?.structuredContent,
          openai.toolResponseMetadata?.call_tool_result?.structuredContent,
          openai.toolResponseMetadata?.mcp_tool_result?.structuredContent,
        ];

        for (const source of sources) {
          if (Array.isArray(source?.products)) {
            return source.products;
          }

          if (Array.isArray(source?._meta?.products)) {
            return source._meta.products;
          }
        }

        return [];
      }

      function render() {
        const products = getProducts();

        if (!products.length) {
          root.innerHTML = "<p>No products to show.</p>";
          return;
        }

        root.innerHTML = '<div class="grid">' + products.map((product) => {
          const title = escapeHtml(product.title);
          const description = escapeHtml(product.description || "No description is available for this product.");
          const image = escapeHtml(product.image);
          const price = escapeHtml(product.price);
          const handle = escapeHtml(product.handle);
          const href = "https://manas-testing.myshopify.com/products/" + encodeURIComponent(product.handle ?? "");

          return '<article class="card">' +
            (image ? '<img class="image" src="' + image + '" alt="' + title + '" />' : '<div class="image"></div>') +
            '<div class="content">' +
              '<h2>' + title + '</h2>' +
              '<p>' + description + '</p>' +
              '<div class="meta"><span>' + escapeHtml(product.brand || "") + '</span><span class="price">$' + price + '</span></div>' +
              '<a href="' + href + '" target="_blank" rel="noopener noreferrer">View Product</a>' +
            '</div>' +
          '</article>';
        }).join("") + "</div>";
      }

      window.addEventListener("openai:set_globals", render, { passive: true });
      render();
    </script>
  </body>
</html>`;
}
