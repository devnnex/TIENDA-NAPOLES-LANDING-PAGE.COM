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

const downloadLinks = document.querySelectorAll("[data-download]");
const versionLabel = document.querySelector("[data-download-version]");
const sizeLabel = document.querySelector("[data-download-size]");
const downloadSummary = document.querySelector("[data-download-summary]");
const latestReleaseApi = "https://api.github.com/repos/devnnex/TIENDA-NAPOLES-OFF-LINE.COM/releases/latest";
let downloadPending = false;
let lookupVersion = 0;

async function getLatestInstaller() {
  const response = await fetch(latestReleaseApi, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!response.ok) throw new Error("No se pudo consultar la última versión.");

  const release = await response.json();
  const asset = release.assets?.find((item) =>
    item.state === "uploaded" &&
    /^Tienda-Napoles-Offline-Setup-(?:\d+\.){2}\d+\.exe$/i.test(item.name)
  );
  if (!asset?.browser_download_url) throw new Error("La última versión no tiene instalador para Windows.");

  const url = new URL(asset.browser_download_url);
  if (url.origin !== "https://github.com" ||
      !url.pathname.startsWith("/devnnex/TIENDA-NAPOLES-OFF-LINE.COM/releases/download/")) {
    throw new Error("La dirección del instalador no es válida.");
  }
  return { release, asset, url: url.href };
}

function showLatestInstaller({ release, asset, url }) {
  const version = String(release.tag_name || "").replace(/^v/i, "");
  const size = `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(asset.size / 1000000)} MB`;
  downloadLinks.forEach((link) => { link.href = url; });
  if (versionLabel) versionLabel.textContent = `VERSIÓN ${version}`;
  if (sizeLabel) sizeLabel.textContent = size;
  if (downloadSummary) downloadSummary.textContent = `Versión ${version} · Instalador para Windows · Descarga directa`;
}

function showDownloadError() {
  downloadLinks.forEach((link) => { link.href = "#descarga"; });
  if (versionLabel) versionLabel.textContent = "VERSIÓN NO DISPONIBLE";
  if (sizeLabel) sizeLabel.textContent = "INTENTA DE NUEVO";
  if (downloadSummary) downloadSummary.textContent = "No se pudo verificar la última versión. Intenta de nuevo.";
}

const initialLookup = ++lookupVersion;
void getLatestInstaller()
  .then((installer) => { if (initialLookup === lookupVersion) showLatestInstaller(installer); })
  .catch(() => { if (initialLookup === lookupVersion) showDownloadError(); });

downloadLinks.forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault();
    if (downloadPending) return;
    downloadPending = true;
    lookupVersion++;
    link.classList.add("is-pressed");
    downloadLinks.forEach((item) => item.setAttribute("aria-busy", "true"));
    if (downloadSummary) downloadSummary.textContent = "Buscando el instalador más reciente…";
    try {
      const installer = await getLatestInstaller();
      showLatestInstaller(installer);
      window.location.assign(installer.url);
    } catch (error) {
      showDownloadError();
    } finally {
      downloadPending = false;
      downloadLinks.forEach((item) => item.removeAttribute("aria-busy"));
      window.setTimeout(() => link.classList.remove("is-pressed"), 500);
    }
  });
});
