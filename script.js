(() => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    const hidePreloader = () => {
      preloader.classList.add("preloader--done");
      preloader.setAttribute("aria-busy", "false");
      document.body.classList.remove("preloader-active");

      const removeNode = () => {
        preloader.removeEventListener("transitionend", onTransitionEnd);
        if (preloader.parentNode) preloader.remove();
      };

      const onTransitionEnd = (e) => {
        if (e.target === preloader && e.propertyName === "opacity") removeNode();
      };

      preloader.addEventListener("transitionend", onTransitionEnd);
      window.setTimeout(removeNode, 550);
    };

    if (document.readyState === "complete") {
      window.requestAnimationFrame(hidePreloader);
    } else {
      window.addEventListener("load", hidePreloader, { once: true });
    }
  }

  // Переключення варианта банера через query param: ?hero=a или ?hero=b
  const params = new URLSearchParams(window.location.search);
  const variant = params.get("hero") === "b" ? "b" : "a";

  document.querySelectorAll("[data-hero-variant]").forEach((el) => {
    el.hidden = el.dataset.heroVariant !== variant;
  });

  // Mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("nav--open", open);
    };

    toggle.addEventListener("click", () => {
      const open = nav.classList.contains("nav--open");
      setOpen(!open);
    });

    nav.addEventListener("click", (e) => {
      const a = e.target && e.target.closest && e.target.closest("a");
      if (a) setOpen(false);
    });
  }

  // Header behavior: hide on scroll down, show on scroll up
  const header = document.querySelector(".site-header");
  if (header) {
    let lastY = window.scrollY || 0;
    const minDelta = 6;
    const topThreshold = 32;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = y - lastY;
      if (Math.abs(delta) < minDelta) return;

      if (y <= topThreshold || delta < 0) {
        header.classList.remove("site-header--hidden");
      } else if (delta > 0) {
        header.classList.add("site-header--hidden");
      }

      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

