#!/usr/bin/env node
// check-budgets.mjs: static size budgets for a production build.
//
// Usage:
//   node scripts/check-budgets.mjs <build-dir> [--budgets budgets.json] [--entry index.html]
//                                  [--compression brotli|gzip|raw] [--markdown report.md] [--json]
//
// Requires Node 18+. No dependencies. Works on Windows, macOS and Linux.
//
// What it measures: bytes of files on disk, raw and compressed (gzip or brotli computed locally),
// grouped into categories, plus the entry route's initial assets: <script src>, <link rel=stylesheet>,
// <link rel=modulepreload|preload> and JS reachable through static imports.
// What it does not measure: LCP, INP, CLS, network timing, decode time, GPU memory or frame time.
// Heuristics: static imports are found with a pattern match, dynamic import() is treated as
// deferred, and CSS @import is not followed. Compressed sizes assume your server applies the same
// compression to text-like files.
//
// Exit codes: 0 when all budgets pass (or none are set), 1 when any budget fails, 2 on usage errors.

import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";

const USAGE = "Usage: node check-budgets.mjs <build-dir> [--budgets budgets.json] [--entry index.html] [--compression brotli|gzip|raw] [--markdown report.md] [--json]";

// Extensions servers normally compress. Already-compressed formats (images, video, fonts, KTX2) are counted raw.
const COMPRESSIBLE = new Set([".html", ".htm", ".js", ".mjs", ".cjs", ".css", ".json", ".svg", ".txt", ".xml", ".wasm", ".gltf", ".webmanifest"]);
const CATEGORY = {
  js: [".js", ".mjs", ".cjs"],
  css: [".css"],
  html: [".html", ".htm"],
  font: [".woff2", ".woff", ".ttf", ".otf"],
  image: [".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg", ".ico"],
  video: [".mp4", ".webm", ".mov", ".m4v"],
  audio: [".mp3", ".ogg", ".wav", ".m4a", ".aac", ".flac"],
  model3d: [".glb", ".gltf", ".bin", ".ktx2", ".basis", ".drc", ".hdr", ".exr", ".usdz"],
  wasm: [".wasm"],
  data: [".json", ".txt", ".xml", ".webmanifest"],
};
const BUDGET_KEYS = {
  criticalRoute: "Critical route (entry HTML + initial JS + initial CSS + preloads)",
  initialJs: "Initial JS (entry scripts + static imports)",
  initialCss: "Initial CSS (entry stylesheets)",
  fonts: "All font files",
  largestImage: "Largest single image",
  models3d: "All 3D assets (glb, gltf, bin, ktx2, basis, drc, hdr, exr, usdz)",
  total: "Whole build",
};

function parseArgs(argv) {
  const opts = { dir: null, budgets: null, entry: null, compression: null, markdown: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => { if (i + 1 >= argv.length) throw new Error(`Missing value for ${a}`); return argv[++i]; };
    if (a === "--budgets") opts.budgets = next();
    else if (a === "--entry") opts.entry = next();
    else if (a === "--compression") opts.compression = next();
    else if (a === "--markdown") opts.markdown = next();
    else if (a === "--json") opts.json = true;
    else if (a === "-h" || a === "--help") { console.log(USAGE); process.exit(0); }
    else if (a.startsWith("--")) throw new Error(`Unknown option ${a}`);
    else if (!opts.dir) opts.dir = a;
    else throw new Error(`Unexpected argument ${a}`);
  }
  if (!opts.dir) throw new Error("Missing <build-dir>");
  return opts;
}

async function walk(root, dir = root, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== "node_modules") await walk(root, full, out); }
    else if (entry.isFile() && !entry.name.endsWith(".map")) out.push(full); // source maps are not shipped to visitors
  }
  return out;
}

const toPosix = (p) => p.split(path.sep).join("/");
const categoryOf = (ext) => Object.keys(CATEGORY).find((k) => CATEGORY[k].includes(ext)) || "other";

async function measure(file, root) {
  const buf = await readFile(file);
  const ext = path.extname(file).toLowerCase();
  const compressible = COMPRESSIBLE.has(ext);
  return {
    file: toPosix(path.relative(root, file)),
    abs: path.resolve(file),
    ext,
    category: categoryOf(ext),
    raw: buf.length,
    gzip: compressible ? zlib.gzipSync(buf, { level: 9 }).length : buf.length,
    brotli: compressible ? zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length : buf.length,
    compressible,
    text: compressible && [".html", ".htm", ".js", ".mjs", ".cjs", ".css"].includes(ext) ? buf.toString("utf8") : null,
  };
}

// --- entry-route discovery -------------------------------------------------
function attrs(tag) {
  const out = {};
  const re = /([^\s=<>/"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  re.lastIndex = tag.indexOf(" ") > 0 ? tag.indexOf(" ") : tag.length;
  while ((m = re.exec(tag))) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return out;
}

function resolveRef(ref, fromFile, root) {
  if (!ref || /^(?:[a-z]+:)?\/\//i.test(ref) || /^(data|blob|mailto|tel|javascript):/i.test(ref)) return null; // external or inline
  const clean = ref.split(/[?#]/)[0];
  if (!clean) return null;
  return path.resolve(clean.startsWith("/") ? path.join(root, clean) : path.join(path.dirname(fromFile), clean));
}

function findEntryAssets(html, entryAbs, root) {
  const assets = { js: [], css: [], preload: [], external: [] };
  for (const m of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const tag = m[0];
    const a = attrs(tag);
    const isScript = m[1].toLowerCase() === "script";
    const ref = isScript ? a.src : a.href;
    if (!ref) continue;
    const rel = (a.rel || "").toLowerCase().split(/\s+/);
    const target = resolveRef(ref, entryAbs, root);
    if (!target) { if (/^(?:https?:)?\/\//i.test(ref)) assets.external.push(ref); continue; }
    if (isScript || rel.includes("modulepreload")) assets.js.push(target);
    else if (rel.includes("stylesheet")) assets.css.push(target);
    else if (rel.includes("preload")) assets.preload.push(target);
  }
  return assets;
}

// Static imports and re-exports only. `import(` (dynamic) is deliberately not matched.
const STATIC_IMPORT = /\b(?:import|export)\s*(?:[^'"();]*?\bfrom\s*)?(["'])([^"']+)\1/g;

function staticImportGraph(startFiles, byAbs, root) {
  const seen = new Set();
  const stack = [...startFiles];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    const rec = byAbs.get(file);
    if (!rec) continue;
    seen.add(file);
    if (!rec.text) continue;
    for (const m of rec.text.matchAll(STATIC_IMPORT)) {
      const spec = m[2];
      if (!/^(\.{1,2}\/|\/)/.test(spec)) continue; // bare specifiers are bundled away in production builds
      const target = resolveRef(spec, file, root);
      if (target && byAbs.has(target) && !seen.has(target)) stack.push(target);
    }
  }
  return [...seen];
}

// --- reporting ---------------------------------------------------------------
const fmt = (n) => (n == null ? "–" : n >= 1e6 ? `${(n / 1e6).toFixed(2)} MB` : n >= 1e3 ? `${(n / 1e3).toFixed(1)} kB` : `${n} B`);
const sum = (recs, key) => recs.reduce((t, r) => t + r[key], 0);
const wildcard = (pattern) => new RegExp("^" + pattern.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join("[^/]*") + "$");

async function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (e) { console.error(`${e.message}\n${USAGE}`); process.exit(2); }

  const root = path.resolve(opts.dir);
  try { if (!(await stat(root)).isDirectory()) throw new Error(); }
  catch { console.error(`Build directory not found: ${root}\nRun your production build first (for example "npm run build"), then pass its output folder.`); process.exit(2); }

  let config = { budgets: {} };
  if (opts.budgets) {
    try { config = JSON.parse(await readFile(path.resolve(opts.budgets), "utf8")); }
    catch (e) { console.error(`Could not read budgets file ${opts.budgets}: ${e.message}`); process.exit(2); }
  }
  const compression = opts.compression || config.compression || "brotli";
  if (!["brotli", "gzip", "raw"].includes(compression)) { console.error(`--compression must be brotli, gzip or raw (got "${compression}")`); process.exit(2); }
  const entryRel = opts.entry || config.entry || "index.html";

  const files = await walk(root);
  if (!files.length) { console.error(`No files found in ${root}.`); process.exit(2); }
  const recs = await Promise.all(files.map((f) => measure(f, root)));
  const byAbs = new Map(recs.map((r) => [r.abs, r]));

  // Entry route
  const entryAbs = path.resolve(root, entryRel);
  const entry = byAbs.get(entryAbs);
  const notes = [];
  let initialJs = [], initialCss = [], preloads = [], external = [];
  if (entry && entry.text != null) {
    const found = findEntryAssets(entry.text, entryAbs, root);
    initialJs = staticImportGraph(found.js, byAbs, root).map((f) => byAbs.get(f));
    initialCss = found.css.map((f) => byAbs.get(f)).filter(Boolean);
    preloads = found.preload.map((f) => byAbs.get(f)).filter(Boolean);
    external = found.external;
    const missing = [...found.js, ...found.css, ...found.preload].filter((f) => !byAbs.has(f));
    if (missing.length) notes.push(`Referenced from ${entryRel} but not in the build: ${missing.map((f) => toPosix(path.relative(root, f))).join(", ")}`);
  } else {
    notes.push(`Entry "${entryRel}" not found. Initial-route budgets are skipped. Pass --entry or set "entry" in the budgets file.`);
  }
  if (external.length) notes.push(`External resources on the entry route are not counted: ${external.join(", ")}`);

  const key = compression === "raw" ? "raw" : compression;
  const unique = (list) => [...new Map(list.map((r) => [r.abs, r])).values()];
  const critical = entry ? unique([entry, ...initialJs, ...initialCss, ...preloads]) : [];
  const images = recs.filter((r) => r.category === "image");
  const largestImage = images.sort((a, b) => b[key] - a[key])[0];

  const actuals = {
    criticalRoute: entry ? sum(critical, key) : null,
    initialJs: entry ? sum(initialJs, key) : null,
    initialCss: entry ? sum(initialCss, key) : null,
    fonts: sum(recs.filter((r) => r.category === "font"), key),
    largestImage: largestImage ? largestImage[key] : 0,
    models3d: sum(recs.filter((r) => r.category === "model3d"), key),
    total: sum(recs, key),
  };

  const rows = [];
  for (const [name, label] of Object.entries(BUDGET_KEYS)) {
    const limit = config.budgets?.[name];
    const actual = actuals[name];
    const status = limit == null ? "no budget" : actual == null ? "skipped" : actual <= limit ? "PASS" : "FAIL";
    rows.push({ name, label, actual, limit: limit ?? null, status, rationale: config.rationale?.[name] || "" });
  }
  // Pattern budgets: sum files whose build-relative path matches a * wildcard. With
  // "followImports": true, a matched lazy chunk also counts what it statically imports, minus
  // files already on the entry route (those are cached by then, so they cost nothing extra).
  const onEntry = new Set(initialJs.map((r) => r.abs));
  for (const pb of config.patternBudgets || []) {
    const re = wildcard(pb.pattern);
    let matched = recs.filter((r) => re.test(r.file));
    const direct = matched.length;
    if (pb.followImports && matched.length) {
      matched = staticImportGraph(matched.map((r) => r.abs), byAbs, root).filter((f) => !onEntry.has(f)).map((f) => byAbs.get(f));
    }
    const actual = sum(matched, key);
    const status = !direct ? "no match" : actual <= pb.max ? "PASS" : "FAIL";
    const label = `Files matching ${pb.pattern} (${direct})${pb.followImports ? ` plus their static imports (${matched.length} files)` : ""}`;
    rows.push({ name: pb.name || pb.pattern, label, actual, limit: pb.max, status, rationale: pb.rationale || "" });
    if (!direct) notes.push(`Pattern "${pb.pattern}" matched no files. Check the pattern against your build output names.`);
  }

  const byCategory = Object.entries(recs.reduce((acc, r) => {
    acc[r.category] ??= { files: 0, raw: 0, gzip: 0, brotli: 0 };
    const c = acc[r.category]; c.files++; c.raw += r.raw; c.gzip += r.gzip; c.brotli += r.brotli;
    return acc;
  }, {})).sort((a, b) => b[1].raw - a[1].raw);
  const largest = [...recs].sort((a, b) => b[key] - a[key]).slice(0, 10);
  const failed = rows.filter((r) => r.status === "FAIL");

  if (opts.json) {
    console.log(JSON.stringify({ root: toPosix(root), entry: entryRel, compression, budgets: rows, categories: Object.fromEntries(byCategory), initialJs: initialJs.map((r) => r.file), initialCss: initialCss.map((r) => r.file), preloads: preloads.map((r) => r.file), largest: largest.map(({ file, raw, gzip, brotli }) => ({ file, raw, gzip, brotli })), notes }, null, 2));
  } else {
    const md = [];
    md.push(`# Static budget report`, "");
    md.push(`- Build: \`${toPosix(root)}\` · entry: \`${entryRel}\` · sizes: **${compression}** (computed locally) · ${new Date().toISOString()}`);
    md.push(`- Scope: bytes on disk only. This does not measure LCP, INP, CLS, decode time, GPU memory or frame time.`, "");
    md.push(`## Budgets`, "", `| Budget | Actual | Limit | Status | Rationale |`, `| --- | --- | --- | --- | --- |`);
    for (const r of rows) md.push(`| ${r.label} | ${fmt(r.actual)} | ${fmt(r.limit)} | ${r.status} | ${r.rationale} |`);
    md.push("", `## Entry route`, "", `- Initial JS (${initialJs.length}): ${initialJs.map((r) => `\`${r.file}\``).join(", ") || "none"}`, `- Initial CSS (${initialCss.length}): ${initialCss.map((r) => `\`${r.file}\``).join(", ") || "none"}`, `- Preloads (${preloads.length}): ${preloads.map((r) => `\`${r.file}\``).join(", ") || "none"}`);
    md.push("", `## By category`, "", `| Category | Files | Raw | gzip | brotli |`, `| --- | --- | --- | --- | --- |`);
    for (const [cat, c] of byCategory) md.push(`| ${cat} | ${c.files} | ${fmt(c.raw)} | ${fmt(c.gzip)} | ${fmt(c.brotli)} |`);
    md.push("", `## Largest files (${compression})`, "", `| File | Raw | ${compression} |`, `| --- | --- | --- |`);
    for (const r of largest) md.push(`| \`${r.file}\` | ${fmt(r.raw)} | ${fmt(r[key])} |`);
    if (notes.length) md.push("", `## Notes`, "", ...notes.map((n) => `- ${n}`));
    md.push("", failed.length ? `**${failed.length} budget(s) exceeded.**` : `All set budgets pass.`);
    const text = md.join("\n");
    console.log(text);
    if (opts.markdown) { await writeFile(path.resolve(opts.markdown), text + "\n", "utf8"); console.error(`Report written to ${opts.markdown}`); }
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error(e.stack || String(e)); process.exit(2); });
