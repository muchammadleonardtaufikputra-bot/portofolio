
// MOBILE NAVIGATION

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");

    const isOpen = navLinks.classList.contains("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
});

// CLOSE MENU AFTER CLICKING A LINK

document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

// AUTOMATIC YEAR

document.getElementById("year").textContent =
    new Date().getFullYear();


// SUBTLE 3D TILT + SPOTLIGHT — supports dynamically loaded portfolio cards
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const selector = ".project-card, .skill-card, .portrait-frame";

  function onMove(event) {
    if (reduceMotion.matches || !finePointer.matches) return;
    const card = event.target.closest(selector);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    card.style.setProperty("--spot-x", (x * 100) + "%");
    card.style.setProperty("--spot-y", (y * 100) + "%");
    const maxTilt = card.classList.contains("portrait-frame") ? 6 : 8;
    const tiltX = (0.5 - y) * maxTilt;
    const tiltY = (x - 0.5) * maxTilt;
    card.style.transform = "perspective(900px) rotateX(" + tiltX + "deg) rotateY(" + tiltY + "deg) translateY(-3px)";
  }

  function onLeave(event) {
    const card = event.target.closest(selector);
    if (!card) return;
    card.style.transform = "";
    card.style.removeProperty("--spot-x");
    card.style.removeProperty("--spot-y");
  }

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerout", (event) => {
    const card = event.target.closest(selector);
    if (card && !card.contains(event.relatedTarget)) onLeave(event);
  });

  function reveal(root) {
    const items = root.querySelectorAll(".about-card, .project-card, .skill-card");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(item => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(item => observer.observe(item));
  }

  // Watch cards added later by portfolio-data.json fetch.
  reveal(document);
  const projects = document.querySelector(".projects-grid");
  const skills = document.querySelector(".skills-grid");
  if ("MutationObserver" in window) {
    const observer = new MutationObserver(() => {
      if (projects) reveal(projects);
      if (skills) reveal(skills);
    });
    [projects, skills].filter(Boolean).forEach(node => observer.observe(node, { childList: true }));
  }
})();
