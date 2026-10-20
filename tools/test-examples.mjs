#!/usr/bin/env node
// Browser checks for the skill's technical examples (skills/creative-web-direction/examples/technical).
//
// Usage (from tools/):
//   npm install
//   node test-examples.mjs                    # uses installed Microsoft Edge (channel "msedge")
//   node test-examples.mjs --channel chrome   # or Google Chrome
//   node test-examples.mjs --executable "C:/path/to/chrome.exe"
//   node test-examples.mjs --headed           # watch it run
//
// What this proves: each example's documented behaviours (fallbacks, reduced motion, focus,
// history, WebGL lifecycle) work in one Chromium-based browser, headless, with software WebGL.
// What it does not prove: visual quality, smoothness on real devices, Firefox or Safari
// behaviour, or screen-reader output. Those need manual testing (see references/quality.md).

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "../skills/creative-web-direction");
const args = process.argv.slice(2);
const argValue = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

// ---------- tiny static server (no dependencies) ----------
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const BASE = `http://127.0.0.1:${server.address().port}/examples/technical/`;

// ---------- browser ----------
const launchOptions = {
  headless: !args.includes("--headed"),
  // Software WebGL so the WebGL checks run on machines and CI runners without a GPU.
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
};
if (argValue("--executable")) launchOptions.executablePath = argValue("--executable");
else launchOptions.channel = argValue("--channel") || "msedge";

let browser;
try { browser = await chromium.launch(launchOptions); }
catch (err) {
  console.error(`Could not launch a browser (${launchOptions.channel || launchOptions.executablePath}).`);
  console.error("Install Microsoft Edge or Google Chrome, or pass --executable <path>.\n" + err.message);
  server.close();
  process.exit(2);
}

const results = [];
function check(example, name, pass, detail = "") {
  results.push({ example, name, pass: !!pass, detail });
}

async function openPage(file, { query = "", hash = "", context = {} } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, ...context });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Failed loads are reported as responses below; the console echo of them is skipped here.
  page.on("console", (m) => { if (m.type() === "error" && !/^Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on("response", (r) => { if (r.status() >= 400 && !/\/favicon\.ico$/.test(r.url())) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  await page.goto(BASE + file + query + hash, { waitUntil: "load" });
  return { ctx, page, errors };
}
// Network failures for optional web fonts are not script errors.
const scriptErrors = (errors) => errors.filter((e) => !/fonts\.(googleapis|gstatic)\.com|ERR_INTERNET_DISCONNECTED|net::ERR/i.test(e));

// ---------- line-reveal.html ----------
async function testLineReveal() {
  const ex = "line-reveal";
  {
    const { ctx, page, errors } = await openPage("line-reveal.html");
    await page.waitForFunction(() => window.__lineReveal && document.fonts.status === "loaded");
    await page.waitForTimeout(400);
    const read = () => page.evaluate(() => [...window.__lineReveal.items.values()].map((i) => ({
      sr: i.el.querySelector(".sr-only")?.textContent, hidden: i.visual.getAttribute("aria-hidden"),
      lines: i.lines.map((l) => l.textContent), splits: i.splits, state: i.state })));
    const a = await read();
    check(ex, "every heading keeps exactly one full accessible copy", a.every((i) => i.hidden === "true" && i.lines.join(" ") === i.sr));
    const names = await page.getByRole("heading", { name: "Every line arrives when the reader does", exact: true }).count();
    check(ex, "heading exposes its full text as its accessible name", names === 1, `matches: ${names}`);
    check(ex, "lines group several words at desktop width", a[0].lines.length < a[0].sr.split(" ").length, a[0].lines.join(" | "));
    await page.waitForTimeout(1500);
    check(ex, "above-the-fold heading finishes in the shown state", (await read())[0].state === "shown");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    const b = await read();
    check(ex, "re-splits after a width change and still matches the text", b[0].splits > a[0].splits && b[0].lines.join(" ") === b[0].sr, `splits ${a[0].splits}→${b[0].splits}`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1500);
    const c = await read();
    check(ex, "headings skipped by a fast scroll end up shown", c.every((i) => i.state === "shown"), c.map((i) => i.state).join(","));
    check(ex, "no script errors", scriptErrors(errors).length === 0, scriptErrors(errors).join("; "));
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("line-reveal.html", { context: { reducedMotion: "reduce" } });
    await page.waitForFunction(() => window.__lineReveal);
    const r = await page.evaluate(() => [...window.__lineReveal.items.values()].map((i) => ({ state: i.state, t: i.lines.map((l) => l.style.transform).join("") })));
    check(ex, "reduced motion: every heading shown with no transforms", r.every((i) => i.state === "shown" && i.t === ""));
    await ctx.close();
  }
}

// ---------- scroll-chapter.html ----------
async function testScrollChapter() {
  const ex = "scroll-chapter";
  {
    const { ctx, page, errors } = await openPage("scroll-chapter.html");
    const cls = await page.evaluate(() => document.documentElement.className);
    check(ex, "uses native scroll timelines where supported", /has-timelines/.test(cls) && /motion-ok/.test(cls), cls);
    await page.locator('.step[data-step="3"]').scrollIntoViewIfNeeded();
    await page.evaluate(() => document.querySelector('.step[data-step="3"]').scrollIntoView({ block: "center" }));
    await page.waitForTimeout(400);
    check(ex, "active step follows scroll position", (await page.locator(".stage").getAttribute("data-active")) === "3");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator(".skip-chapter").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1200);
    const after = await page.evaluate(() => ({ focus: document.activeElement?.id, top: Math.round(document.getElementById("after-chapter").getBoundingClientRect().top) }));
    check(ex, "skip link moves focus and view past the chapter", after.focus === "after-chapter" && after.top < 200, JSON.stringify(after));
    check(ex, "no script errors", scriptErrors(errors).length === 0, scriptErrors(errors).join("; "));
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("scroll-chapter.html", { query: "?fallback=1" });
    const cls = await page.evaluate(() => document.documentElement.className);
    check(ex, "?fallback=1 takes the IntersectionObserver path", /no-timelines/.test(cls) && /reveal-ready/.test(cls), cls);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(900);
    const revealed = await page.evaluate(() => [...document.querySelectorAll(".reveal")].every((el) => el.classList.contains("is-visible")));
    check(ex, "fallback reveals content scrolled into or past", revealed);
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("scroll-chapter.html", { context: { reducedMotion: "reduce" } });
    const cls = await page.evaluate(() => document.documentElement.className);
    const opacity = await page.evaluate(() => getComputedStyle(document.querySelector(".reveal")).opacity);
    check(ex, "reduced motion: no motion class and content fully visible", !/motion-ok/.test(cls) && opacity === "1", `${cls} opacity=${opacity}`);
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("scroll-chapter.html", { context: { javaScriptEnabled: false } });
    const opacity = await page.evaluate(() => [...document.querySelectorAll(".reveal")].map((el) => getComputedStyle(el).opacity));
    check(ex, "without JavaScript all content is visible", opacity.every((o) => o === "1"), opacity.join(","));
    await ctx.close();
  }
}

// ---------- shared-element.html ----------
async function testSharedElement() {
  const ex = "shared-element";
  {
    const { ctx, page, errors } = await openPage("shared-element.html", { context: { viewport: { width: 390, height: 700 } } });
    await page.evaluate(() => document.querySelector('.card[href="#work-4"]').scrollIntoView({ block: "center" }));
    await page.waitForTimeout(200);
    const yBefore = await page.evaluate(() => Math.round(window.scrollY));
    await page.click('.card[href="#work-4"]');
    await page.waitForTimeout(900);
    const open = await page.evaluate(() => ({ hash: location.hash, focus: document.activeElement?.id, visible: !!document.querySelector("#work-4.is-active"), title: document.title, method: document.getElementById("harness").textContent }));
    check(ex, "opening a work updates URL, view, focus and title", open.hash === "#work-4" && open.visible && open.focus === "work-4-title" && /Paper Weather/.test(open.title), JSON.stringify(open));
    check(ex, "uses the View Transitions API where available", /View Transitions API/.test(open.method), open.method);
    await page.goBack();
    await page.waitForTimeout(900);
    const back = await page.evaluate(() => ({ hash: location.hash, focus: document.activeElement?.getAttribute("href"), y: Math.round(window.scrollY), indexVisible: getComputedStyle(document.getElementById("index")).display !== "none" }));
    check(ex, "back restores the index, its scroll position and focus", back.indexVisible && back.focus === "#work-4" && Math.abs(back.y - yBefore) <= 2, `${JSON.stringify(back)} before=${yBefore}`);
    await page.goForward();
    await page.waitForTimeout(900);
    check(ex, "forward reopens the work", await page.evaluate(() => !!document.querySelector("#work-4.is-active")));
    check(ex, "no script errors", scriptErrors(errors).length === 0, scriptErrors(errors).join("; "));
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("shared-element.html", { hash: "#work-3" });
    check(ex, "deep link or refresh opens the right view", await page.evaluate(() => !!document.querySelector("#work-3.is-active") && getComputedStyle(document.getElementById("index")).display === "none"));
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("shared-element.html", { query: "?flip=1" });
    await page.click('.card[href="#work-1"]');
    await page.waitForTimeout(700);
    const method = await page.textContent("#harness");
    check(ex, "?flip=1 uses the FLIP fallback and still opens the work", /FLIP/.test(method) && await page.evaluate(() => !!document.querySelector("#work-1.is-active")), method);
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("shared-element.html", { context: { reducedMotion: "reduce" } });
    await page.click('.card[href="#work-2"]');
    await page.waitForTimeout(300);
    const method = await page.textContent("#harness");
    check(ex, "reduced motion: no transition, instant view change", /reduced motion/.test(method) && await page.evaluate(() => !!document.querySelector("#work-2.is-active")), method);
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("shared-element.html", { context: { javaScriptEnabled: false } });
    const shown = await page.evaluate(() => [...document.querySelectorAll(".detail")].filter((d) => getComputedStyle(d).display !== "none").length);
    check(ex, "without JavaScript every work is reachable as a section", shown === 4, `${shown} visible`);
    await ctx.close();
  }
}

// ---------- webgl-scene.html ----------
async function testWebglScene() {
  const ex = "webgl-scene";
  const state = (page) => page.evaluate(() => document.getElementById("scene").dataset.state);
  {
    const { ctx, page, errors } = await openPage("webgl-scene.html");
    try {
      await page.waitForFunction(() => document.getElementById("scene").dataset.state === "3d", null, { timeout: 20000 });
      check(ex, "3D view mounts after load and replaces the diagram", true);
    } catch {
      check(ex, "3D view mounts after load and replaces the diagram", false, await page.textContent("#scene-status"));
      await ctx.close();
      return;
    }
    await page.evaluate(() => { const h = document.getElementById("harness"); h.open = true; });
    const frames = () => page.evaluate(() => window.__orrery.framesRendered);
    await page.waitForTimeout(500);
    const f0 = await frames(); await page.waitForTimeout(1000); const f1 = await frames();
    check(ex, "renders nothing while at rest (on-demand loop)", f1 === f0, `${f1 - f0} frames in 1 s idle`);
    await page.click('[data-step="30"]');
    await page.waitForTimeout(150);
    const moving = await frames();
    await page.waitForFunction(() => window.__orrery.rafId === 0 && window.__orrery.state.shownDay === window.__orrery.state.targetDay, null, { timeout: 5000 }).catch(() => {});
    const settled = await page.evaluate(() => ({ idle: window.__orrery.rafId === 0, eq: window.__orrery.state.shownDay === window.__orrery.state.targetDay }));
    check(ex, "a step animates, settles and stops the loop", moving > f1 && settled.idle && settled.eq, `${moving - f1} frames; ${JSON.stringify(settled)}`);
    const sample = () => page.evaluate(() => window.__orrery.scene3d.samplePixel());
    const close = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 6);
    const reference = await sample();

    // Dispose, then mount again.
    const removeAndReport = async () => {
      await page.click("#h-remove");
      await page.waitForTimeout(300);
      return (await page.textContent("#stats")).split("\n").pop();
    };
    let report = await removeAndReport();
    check(ex, "disposal releases every geometry and texture it created", /after dispose: geometries 0, textures 0 \(owned\)/.test(report), report);
    check(ex, "removing the 3D view leaves the diagram", (await state(page)) === "fallback" && (await page.locator(".scene-canvas").count()) === 0);
    await page.click("#h-add");
    await page.waitForFunction(() => document.getElementById("scene").dataset.state === "3d", null, { timeout: 15000 }).catch(() => {});
    check(ex, "the 3D view can be mounted again", (await state(page)) === "3d" && (await page.locator(".scene-canvas").count()) === 1);
    const remounted = await sample();
    check(ex, "a remounted scene renders identically", close(remounted, reference), `${reference} vs ${remounted}`);

    // Context loss and restore, including GPU-generated lighting.
    await page.click("#h-lose");
    await page.waitForTimeout(500);
    const lostState = await state(page);
    const lostStatus = await page.textContent("#scene-status");
    check(ex, "context loss shows the diagram fallback", lostState === "fallback" && /interrupted/.test(lostStatus), `${lostState}: ${lostStatus}`);
    await page.click("#h-restore");
    await page.waitForFunction(() => document.getElementById("scene").dataset.state === "3d", null, { timeout: 8000 }).catch(() => {});
    check(ex, "context restore returns to the 3D view", (await state(page)) === "3d");
    const restored = await sample();
    check(ex, "lighting survives a context restore (environment rebuilt)", close(restored, reference), `${reference} vs ${restored}`);
    report = await removeAndReport();
    check(ex, "disposal after a restore still releases everything owned", /after dispose: geometries 0, textures 0 \(owned\)/.test(report), report);
    await page.click("#h-add");
    await page.waitForFunction(() => document.getElementById("scene").dataset.state === "3d", null, { timeout: 15000 }).catch(() => {});
    const live = await page.textContent("#date-out");
    check(ex, "controls update the HTML readout", /\d{4}/.test(live), live);
    check(ex, "no script errors", scriptErrors(errors).length === 0, scriptErrors(errors).join("; "));
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("webgl-scene.html", { query: "?fail=1" });
    await page.waitForFunction(() => /could not load/.test(document.getElementById("scene-status").textContent), null, { timeout: 15000 }).catch(() => {});
    const status = await page.textContent("#scene-status");
    const diagram = await page.locator("[data-testid=scene-fallback]").isVisible();
    check(ex, "library load failure keeps the designed fallback", /could not load/.test(status) && diagram && (await state(page)) === "fallback", status);
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("webgl-scene.html", { query: "?nowebgl=1" });
    await page.waitForTimeout(1200);
    const status = await page.textContent("#scene-status");
    check(ex, "missing WebGL keeps the designed fallback", /unavailable/.test(status) && (await state(page)) === "fallback", status);
    await page.click('[data-step="30"]');
    await page.waitForTimeout(600);
    check(ex, "controls still work without WebGL", /\d{4}/.test(await page.textContent("#date-out")));
    await ctx.close();
  }
  {
    const { ctx, page } = await openPage("webgl-scene.html", { context: { reducedMotion: "reduce" } });
    await page.waitForFunction(() => document.getElementById("scene").dataset.state === "3d", null, { timeout: 20000 }).catch(() => {});
    await page.click('[data-step="30"]');
    await page.waitForTimeout(200);
    const s = await page.evaluate(() => ({ eq: window.__orrery.state.shownDay === window.__orrery.state.targetDay, idle: window.__orrery.rafId === 0 }));
    check(ex, "reduced motion: changes apply at once with no easing", s.eq && s.idle, JSON.stringify(s));
    await ctx.close();
  }
}

// ---------- run ----------
const suites = [testLineReveal, testScrollChapter, testSharedElement, testWebglScene];
for (const suite of suites) {
  try { await suite(); }
  catch (err) { check(suite.name, "suite ran to completion", false, err.message); }
}
await browser.close();
server.close();

const version = browser.version();
const failed = results.filter((r) => !r.pass);
console.log(`\nExample checks · ${launchOptions.channel || launchOptions.executablePath} ${version} · headless=${launchOptions.headless} · ${new Date().toISOString()}\n`);
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.example.padEnd(15)} ${r.name}${r.pass || !r.detail ? "" : `\n      ${r.detail}`}`);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exit(failed.length ? 1 : 0);
