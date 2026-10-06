"use strict";

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("js-ready");
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: "0px 0px 50px 0px" });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

document.querySelectorAll("[data-download]").forEach((link) => {
  link.addEventListener("click", () => {
    link.classList.add("is-pressed");
    window.setTimeout(() => link.classList.remove("is-pressed"), 500);
  });
});
