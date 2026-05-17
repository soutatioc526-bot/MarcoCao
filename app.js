(function () {
  const { animate, createTimeline, stagger } = window.anime || {};

  if (!animate || !createTimeline || !stagger) {
    document.documentElement.classList.add("no-anime");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qs = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  function drawRoute() {
    const route = document.querySelector(".route");
    const dot = document.querySelector(".route-dot");
    if (!route || !dot) return;

    const length = route.getTotalLength();
    route.style.strokeDasharray = length;
    route.style.strokeDashoffset = length;

    animate(route, {
      strokeDashoffset: [length, 0],
      duration: 1800,
      ease: "inOutCubic",
      delay: 260
    });

    const path = route;
    const state = { progress: 0 };
    animate(state, {
      progress: 1,
      duration: 1800,
      ease: "inOutCubic",
      delay: 260,
      onUpdate: function () {
        const point = path.getPointAtLength(length * state.progress);
        dot.setAttribute("cx", point.x);
        dot.setAttribute("cy", point.y);
      }
    });

    animate(dot, {
      r: [5, 10, 7],
      duration: 1100,
      delay: 1600,
      ease: "outElastic(1, .7)"
    });
  }

  function countUp(scope = document) {
    qs("[data-counter]", scope).forEach((node) => {
      const target = Number(node.dataset.to || "0");
      const state = { value: 0 };
      node.textContent = "0";
      animate(state, {
        value: target,
        duration: 1500,
        delay: 180,
        ease: "outCubic",
        onUpdate: function () {
          node.textContent = Math.round(state.value).toLocaleString("zh-CN");
        }
      });
    });
  }

  function intro() {
    const timeline = createTimeline({
      defaults: {
        ease: "outExpo",
        duration: 860
      }
    });

    timeline
      .add(".site-header", { y: [-18, 0], opacity: [0, 1] }, 0)
      .add(".hero-title .line", {
        y: [120, 0],
        rotate: [-4, 0],
        opacity: [0, 1],
        delay: stagger(110)
      }, 120)
      .add(".hero-copy [data-animate]", {
        y: [26, 0],
        opacity: [0, 1],
        delay: stagger(65)
      }, 420)
      .add(".hero-board", {
        x: [80, 0],
        opacity: [0, 1],
        scale: [0.96, 1]
      }, 360)
      .add(".metric-strip article", {
        y: [18, 0],
        opacity: [0, 1],
        delay: stagger(80)
      }, 760);

    drawRoute();
    countUp(document.querySelector(".hero-board"));
  }

  function revealOnScroll() {
    const targets = qs("[data-animate]").filter((node) => !node.closest(".hero") && !node.closest(".site-header"));

    targets.forEach((node) => {
      node.style.opacity = "0";
      node.style.transform = "translateY(34px)";
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target;

        animate(node, {
          opacity: [0, 1],
          y: [34, 0],
          duration: 760,
          ease: "outExpo"
        });

        if (node.querySelector("[data-counter]")) countUp(node);
        observer.unobserve(node);
      });
    }, {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    });

    targets.forEach((node) => observer.observe(node));
  }

  function cardInteractions() {
    qs(".work-card, .data-card, .timeline-item, .fit-card, .education-card, .skill-cloud span").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        animate(card, {
          scale: 1.015,
          duration: 260,
          ease: "outCubic"
        });
      });
      card.addEventListener("mouseleave", () => {
        animate(card, {
          scale: 1,
          duration: 320,
          ease: "outCubic"
        });
      });
    });
  }

  function navInteractions() {
    qs(".nav a, .brand, .replay").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        animate(item, { y: -2, duration: 180, ease: "outCubic" });
      });
      item.addEventListener("mouseleave", () => {
        animate(item, { y: 0, duration: 220, ease: "outCubic" });
      });
    });
  }

  function ambientMotion() {
    animate(".route-dot", {
      scale: [1, 1.32],
      opacity: [0.86, 1],
      duration: 950,
      loop: true,
      alternate: true,
      ease: "inOutSine"
    });

    animate(".hero-board", {
      y: [0, -8],
      duration: 3600,
      loop: true,
      alternate: true,
      ease: "inOutSine"
    });
  }

  function replay() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    qs("[data-counter]").forEach((node) => {
      node.textContent = "0";
    });
    intro();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (reduceMotion) {
      countUp();
      return;
    }

    intro();
    revealOnScroll();
    cardInteractions();
    navInteractions();
    ambientMotion();

    const replayButton = document.querySelector("[data-replay]");
    if (replayButton) replayButton.addEventListener("click", replay);
  });
}());
