const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
const repo = "https://github.com/devnnex/TIENDA-NAPOLES-OFF-LINE.COM";

function release(version, assets = null) {
  const name = `Tienda-Napoles-Offline-Setup-${version}.exe`;
  return {
    tag_name: `v${version}`,
    assets: assets || [{
      name,
      state: "uploaded",
      size: 2931583,
      browser_download_url: `${repo}/releases/download/v${version}/${name}`
    }]
  };
}

function element() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    href: "#descarga",
    textContent: "",
    classList: { add() {}, remove() {} },
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
    addEventListener(name, listener) { listeners.set(name, listener); },
    async click() { await listeners.get("click")({ preventDefault() {} }); }
  };
}

async function setup(responses) {
  const links = [element(), element(), element()];
  const version = element();
  const size = element();
  const summary = element();
  const navigations = [];
  let requests = 0;
  const document = {
    documentElement: { classList: { add() {} } },
    getElementById() { return null; },
    querySelectorAll(selector) { return selector === "[data-download]" ? links : []; },
    querySelector(selector) {
      return {
        "[data-download-version]": version,
        "[data-download-size]": size,
        "[data-download-summary]": summary
      }[selector] || null;
    }
  };
  const context = {
    document,
    window: {
      matchMedia: () => ({ matches: true }),
      setTimeout: (callback) => callback(),
      location: { assign(url) { navigations.push(url); } }
    },
    fetch: async (url, options) => {
      assert.match(url, /\/releases\/latest$/);
      assert.equal(options.cache, "no-store");
      const response = responses[requests++];
      if (response instanceof Error) throw response;
      return { ok: true, json: async () => response };
    },
    URL,
    Intl
  };
  vm.runInNewContext(script, context);
  await new Promise((resolve) => setImmediate(resolve));
  return { links, version, size, summary, navigations, requestCount: () => requests };
}

test("cada clic descarga el instalador de la release más reciente, aunque cambie después de cargar la página", async () => {
  const page = await setup([release("1.0.3"), release("1.0.4")]);
  assert.equal(page.version.textContent, "VERSIÓN 1.0.3");
  await page.links[1].click();
  assert.equal(page.requestCount(), 2);
  assert.equal(page.version.textContent, "VERSIÓN 1.0.4");
  assert.deepEqual(page.navigations, [
    `${repo}/releases/download/v1.0.4/Tienda-Napoles-Offline-Setup-1.0.4.exe`
  ]);
});

test("si falla la consulta, no entrega una versión antigua", async () => {
  const page = await setup([release("1.0.3"), new Error("sin acceso a GitHub")]);
  await page.links[0].click();
  assert.equal(page.links[0].href, "#descarga");
  assert.equal(page.navigations.length, 0);
  assert.match(page.summary.textContent, /No se pudo verificar/);
});

test("ignora una release sin instalador Windows compatible", async () => {
  const page = await setup([release("1.0.4", [{
    name: "Source.zip",
    state: "uploaded",
    browser_download_url: `${repo}/releases/download/v1.0.4/Source.zip`
  }])]);
  assert.equal(page.links[0].href, "#descarga");
  assert.match(page.summary.textContent, /No se pudo verificar/);
});
