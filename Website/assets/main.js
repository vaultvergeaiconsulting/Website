/* =========================
   MOBILE MENU + SUBMENU
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // Footer year (optional)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const headerEl = document.querySelector("header");
  const burger = document.querySelector("[data-hamburger]");

  // Toggle menu
  if (burger && headerEl) {
    // Ensure aria-expanded exists
    if (!burger.hasAttribute("aria-expanded")) burger.setAttribute("aria-expanded", "false");

    burger.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = headerEl.classList.toggle("open");
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close on nav link click (mobile)
    headerEl.querySelectorAll("nav a").forEach((a) => {
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 900px)").matches) {
          headerEl.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Close when clicking outside header (mobile)
    document.addEventListener("click", (e) => {
      if (!window.matchMedia("(max-width: 900px)").matches) return;
      if (!headerEl.classList.contains("open")) return;
      if (headerEl.contains(e.target)) return;
      headerEl.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!headerEl.classList.contains("open")) return;
      headerEl.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.focus?.();
    });
  }

  // Mobile services sub-menu
  const mobileServices = document.querySelector("[data-mobile-services]");
  const mobileSub = document.querySelector("[data-mobile-sub]");
  if (mobileServices && mobileSub) {
    mobileServices.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = mobileSub.style.display === "block";
      mobileSub.style.display = isOpen ? "none" : "block";
    });
  }
});


/* =========================
   SHARE BUTTONS (BLOG POST)
========================= */
function openShare(url){
  window.open(url, "_blank", "noopener,noreferrer,width=800,height=600");
}

document.querySelectorAll("[data-share]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const type = btn.getAttribute("data-share");
    const pageUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    if (type === "copy") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        const old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = old || "Copy link"), 900);
      } catch {
        alert("Copy failed. You can copy the URL from the address bar.");
      }
      return;
    }

    if (type === "native" && navigator.share) {
      try { await navigator.share({ title: document.title, url: window.location.href }); }
      catch { /* user cancelled */ }
      return;
    }

    const map = {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${pageUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
      whatsapp: `https://wa.me/?text=${title}%20${pageUrl}`
    };
    if (map[type]) openShare(map[type]);
  });
});


/* =========================
   TABLE OF CONTENTS (POST)
========================= */
const tocEl = document.querySelector("[data-toc]");
const articleEl = document.querySelector("article");
if (tocEl && articleEl) {
  const headings = [...articleEl.querySelectorAll("h2, h3")]
    .filter(h => h.textContent.trim().length > 0);

  if (headings.length) {
    tocEl.innerHTML = "";
    headings.forEach(h => {
      if (!h.id) {
        h.id = h.textContent.trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 60);
      }
      const a = document.createElement("a");
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      a.style.paddingLeft = h.tagName === "H3" ? "18px" : "10px";
      tocEl.appendChild(a);
    });
  } else {
    tocEl.innerHTML = "<span class='badge'>No headings found</span>";
  }
}


/* =========================
   HERO CAROUSEL (fade)
========================= */
(function () {
  function initCarousel(root) {
    const slides = Array.from(root.querySelectorAll(".carousel__slide"));
    const dotsWrap = root.querySelector(".carousel__dots");
    const prevBtn = root.querySelector(".carousel__btn.prev");
    const nextBtn = root.querySelector(".carousel__btn.next");

    if (!slides.length) return;

    let index = slides.findIndex(s => s.classList.contains("is-active"));
    if (index < 0) index = 0;

    // Build dots
    let dots = [];
    if (dotsWrap) dotsWrap.innerHTML = "";

    dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carousel__dot" + (i === index ? " is-active" : "");
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    function render() {
      slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    if (nextBtn) nextBtn.addEventListener("click", next);
    if (prevBtn) prevBtn.addEventListener("click", prev);

    // Auto-rotate
    const intervalMs = parseInt(root.dataset.interval || "9500", 10);
    const shouldAuto = Number.isFinite(intervalMs) && intervalMs > 0 && slides.length > 1;

    let timer = null;
    const start = () => { if (shouldAuto && !timer) timer = setInterval(next, intervalMs); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    render();
    start();
  }

  // Scroll reveal animation (with stagger)
  function initReveal() {
    const blocks = document.querySelectorAll(".reveal");
    if (!blocks.length) return;

    // Set stagger delays once
    blocks.forEach(block => {
      block.querySelectorAll("[data-stagger]").forEach(group => {
        [...group.children].forEach((child, i) => {
          child.style.transitionDelay = `${80 * i}ms`;
        });
      });
    });

    // Respect reduced motion
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      blocks.forEach(b => b.classList.add("is-visible"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      blocks.forEach(b => b.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    blocks.forEach(b => io.observe(b));
  }

  // Blog filter/search (optional; only runs if elements exist)
  function initBlogFilters() {
    const search = document.querySelector("[data-blog-search]");
    const grid = document.querySelector("[data-post-grid]");
    const chips = document.querySelectorAll("[data-filter]");
    if (!grid) return;

    let activeFilter = "all";
    const normalize = (s) => (s || "").toLowerCase().trim();

    const apply = () => {
      const q = normalize(search?.value);
      const posts = grid.querySelectorAll("[data-title][data-tags]");

      posts.forEach((p) => {
        const title = normalize(p.getAttribute("data-title"));
        const tags = normalize(p.getAttribute("data-tags"));
        const matchesText = !q || title.includes(q) || tags.includes(q);
        const matchesFilter = activeFilter === "all" || tags.includes(activeFilter);
        p.style.display = matchesText && matchesFilter ? "" : "none";
      });
    };

    chips.forEach((btn) => {
      btn.addEventListener("click", () => {
        chips.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeFilter = btn.getAttribute("data-filter") || "all";
        apply();
      });
    });

    search?.addEventListener("input", apply);
    apply();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-carousel]").forEach(initCarousel);
    initReveal();
    initBlogFilters();
  });
})();

// =========================
// Scroll-to-top button (all pages)
// =========================
(function () {
  // Avoid adding twice
  if (document.querySelector(".scrolltop")) return;

  const btn = document.createElement("button");
  btn.className = "scrolltop";
  btn.type = "button";
  btn.setAttribute("aria-label", "Scroll to top");
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5l-7 7 1.4 1.4L11 8.8V20h2V8.8l4.6 4.6L19 12z" fill="currentColor"></path>
    </svg>
  `;

  document.body.appendChild(btn);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toggle = () => {
    if (window.scrollY > 450) btn.classList.add("is-visible");
    else btn.classList.remove("is-visible");
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
})();