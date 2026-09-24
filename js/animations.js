(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const magneticItems = document.querySelectorAll(".button, .nav-cta");
  magneticItems.forEach((item) => {
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      item.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
      item.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
    };
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
      if (!frame) frame = requestAnimationFrame(paint);
    }, { passive: true });
    item.addEventListener("pointerleave", () => {
      item.style.setProperty("--magnetic-x", "0px");
      item.style.setProperty("--magnetic-y", "0px");
    });
  });

  document.querySelectorAll(".feature-card, .work-card").forEach((card) => {
    let frame = 0;
    let rotateX = 0;
    let rotateY = 0;
    const paint = () => {
      frame = 0;
      card.style.setProperty("--card-rotate-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--card-rotate-y", `${rotateY.toFixed(2)}deg`);
      card.classList.add("is-tilting");
    };
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 3;
      rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -3;
      if (!frame) frame = requestAnimationFrame(paint);
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.removeProperty("--card-rotate-x");
      card.style.removeProperty("--card-rotate-y");
    });
  });
})();