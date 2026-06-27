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

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #1f1f1f;
        color: #f6f6f6;
      }

      main {
        padding: 14px;
      }

      .shell {
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 18px;
        background: #252525;
        padding: 12px;
      }

      .header {
        align-items: center;
        display: flex;
        gap: 12px;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .eyebrow {
        color: #a3a3a3;
        font-size: 12px;
        font-weight: 650;
        margin: 0 0 2px;
      }

      h1 {
        font-size: 17px;
        line-height: 1.2;
        margin: 0;
      }

      .controls {
        display: flex;
        gap: 8px;
      }

      button {
        align-items: center;
        background: #333;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 999px;
        color: #f6f6f6;
        cursor: pointer;
        display: inline-flex;
        font-size: 20px;
        height: 34px;
        justify-content: center;
        line-height: 1;
        width: 34px;
      }

      .carousel {
        display: grid;
        gap: 12px;
        grid-auto-columns: minmax(210px, 245px);
        grid-auto-flow: column;
        overflow-x: auto;
        overscroll-behavior-inline: contain;
        padding-bottom: 2px;
        scroll-snap-type: inline mandatory;
        scrollbar-width: none;
      }

      .carousel::-webkit-scrollbar {
        display: none;
      }

      .card {
        background: #202020;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        min-width: 0;
        overflow: hidden;
        scroll-snap-align: start;
      }

      .media {
        background: #f7f7f7;
        position: relative;
      }

      .image {
        aspect-ratio: 1.35 / 1;
        display: block;
        object-fit: cover;
        width: 100%;
      }

      .badge {
        background: rgba(0, 0, 0, 0.72);
        border-radius: 999px;
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        padding: 5px 8px;
        position: absolute;
        right: 8px;
        top: 8px;
      }

      .content {
        display: grid;
        gap: 9px;
        padding: 12px;
      }

      h2 {
        display: -webkit-box;
        font-size: 15px;
        line-height: 1.25;
        margin: 0;
        min-height: 38px;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .brand {
        color: #a3a3a3;
        font-size: 12px;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tags {
        display: flex;
        gap: 6px;
        min-height: 25px;
        overflow: hidden;
      }

      .tag {
        background: #3d3d3d;
        border-radius: 7px;
        color: #e8e8e8;
        flex: 0 0 auto;
        font-size: 11px;
        padding: 5px 7px;
      }

      .footer {
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        gap: 10px;
        justify-content: space-between;
        padding-top: 10px;
      }

      .price {
        font-size: 20px;
        font-weight: 800;
      }

      .actions {
        display: flex;
        flex: 0 0 auto;
        gap: 7px;
      }

      a {
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 8px;
        color: #f6f6f6;
        flex: 0 0 auto;
        font-size: 13px;
        font-weight: 700;
        padding: 9px 11px;
        text-decoration: none;
      }

      .checkout {
        background: #f6f6f6;
        color: #202020;
      }

      .empty {
        color: #cfcfcf;
        margin: 0;
        padding: 18px;
      }

      @media (max-width: 520px) {
        main {
          padding: 10px;
        }

        .header {
          align-items: flex-start;
        }

        .carousel {
          grid-auto-columns: minmax(205px, 82%);
        }
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

      function money(value) {
        const numeric = Number(value);

        if (Number.isFinite(numeric)) {
          return "$" + numeric.toFixed(2);
        }

        return value ? "$" + escapeHtml(value) : "See price";
      }

      function notifyHeight() {
        window.openai?.notifyIntrinsicHeight?.(document.body.scrollHeight);
      }

      function scrollCarousel(direction) {
        const carousel = document.querySelector(".carousel");

        if (!carousel) {
          return;
        }

        carousel.scrollBy({
          left: direction * Math.round(carousel.clientWidth * 0.86),
          behavior: "smooth",
        });
      }

      function render() {
        const products = getProducts();

        if (!products.length) {
          root.innerHTML = '<section class="shell"><p class="empty">No products to show.</p></section>';
          notifyHeight();
          return;
        }

        root.innerHTML =
          '<section class="shell">' +
            '<div class="header">' +
              '<div><p class="eyebrow">Shopify catalog</p><h1>Featured products</h1></div>' +
              '<div class="controls">' +
                '<button type="button" aria-label="Previous products" data-dir="-1">&lsaquo;</button>' +
                '<button type="button" aria-label="Next products" data-dir="1">&rsaquo;</button>' +
              '</div>' +
            '</div>' +
            '<div class="carousel">' +
              products.map((product) => {
                const title = escapeHtml(product.title);
                const image = escapeHtml(product.image);
                const brand = escapeHtml(product.brand || "Shopify");
                const handle = product.handle ?? "";
                const productUrl = escapeHtml(product.productUrl || ("https://manas-testing.myshopify.com/products/" + encodeURIComponent(handle)));
                const checkoutUrl = escapeHtml(product.checkoutUrl || productUrl);
                const tags = Array.isArray(product.tags) ? product.tags.slice(0, 3) : [];

                return '<article class="card">' +
                  '<div class="media">' +
                    (image ? '<img class="image" src="' + image + '" alt="' + title + '" />' : '<div class="image"></div>') +
                    '<span class="badge">' + money(product.price) + '</span>' +
                  '</div>' +
                  '<div class="content">' +
                    '<div><h2>' + title + '</h2><p class="brand">' + brand + '</p></div>' +
                    '<div class="tags">' + tags.map((tag) => '<span class="tag">' + escapeHtml(tag) + '</span>').join("") + '</div>' +
                    '<div class="footer"><span class="price">' + money(product.price) + '</span><div class="actions"><a href="' + productUrl + '" target="_blank" rel="noopener noreferrer">View</a><a class="checkout" href="' + checkoutUrl + '" target="_blank" rel="noopener noreferrer">Checkout</a></div></div>' +
                  '</div>' +
                '</article>';
              }).join("") +
            '</div>' +
          '</section>';

        for (const button of root.querySelectorAll("button[data-dir]")) {
          button.addEventListener("click", () => scrollCarousel(Number(button.dataset.dir)));
        }

        for (const image of root.querySelectorAll("img")) {
          image.addEventListener("load", notifyHeight, { once: true });
        }

        notifyHeight();
      }

      window.addEventListener("openai:set_globals", render, { passive: true });
      render();
    </script>
  </body>
</html>`;
}
