#!/usr/bin/env node
// validate-package.mjs: structural checks for this repository's skill package.
//
// Usage (from the repository root or tools/):  node tools/validate-package.mjs
// Requires Node 18+. No dependencies.
//
// Checks
//   - SKILL.md frontmatter against the Agent Skills spec and the stricter rules used by
//     claude.ai uploads and the Skills API (allowed keys, name format, lengths, no angle brackets)
//   - SKILL.md body length (< 500 lines) and exactly one SKILL.md per skill
//   - every relative Markdown link and #anchor resolves (code spans and fences are ignored)
//   - references, templates and examples are linked directly from SKILL.md (one level deep)
//   - long reference files start with a Contents section
//   - backtick paths in SKILL.md (scripts/…, references/…) exist
//   - JSON files parse, and evals.json and trigger-evals.json have the expected shape
//   - no leftover TODO, TBD or lorem ipsum in the shipped skill
// It cannot judge whether the skill's guidance is good. Behavioural evals do that (evals/README.md).

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWED_KEYS = new Set(["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
const errors = [];
const warnings = [];
const rel = (p) => path.relative(REPO, p).split(path.sep).join("/");
const err = (file, msg) => errors.push(`${rel(file)}: ${msg}`);
const warn = (file, msg) => warnings.push(`${rel(file)}: ${msg}`);

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out); else out.push(full);
  }
  return out;
}

// Minimal YAML for frontmatter: `key: value`, quoted values, `>`/`|` block scalars, one level of nested maps.
function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") return { error: "frontmatter must start on line 1 with ---" };
  const end = lines.indexOf("---", 1);
  if (end < 0) return { error: "frontmatter is not closed with ---" };
  const data = {};
  let i = 1;
  const unquote = (v) => {
    v = v.trim();
    if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
    if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
    return v;
  };
  while (i < end) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) { i++; continue; }
    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!m) return { error: `cannot parse frontmatter line ${i + 1}: ${line}` };
    const [, key, rawValue] = m;
    if (/^[>|][+-]?$/.test(rawValue.trim())) {
      const block = [];
      i++;
      while (i < end && (/^\s+/.test(lines[i]) || !lines[i].trim())) { block.push(lines[i].trim()); i++; }
      data[key] = rawValue.trim().startsWith(">") ? block.join(" ").trim() : block.join("\n").trim();
      continue;
    }
    if (rawValue.trim() === "") {
      const map = {};
      i++;
      while (i < end && /^\s+\S/.test(lines[i])) {
        const mm = /^\s+([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
        if (mm) map[mm[1]] = unquote(mm[2]);
        i++;
      }
      data[key] = map;
      continue;
    }
    try { data[key] = unquote(rawValue); } catch { return { error: `invalid quoted value for ${key}` }; }
    i++;
  }
  return { data, bodyStart: end + 1, lines };
}

// GitHub-style heading anchors.
function slugify(heading) {
  return heading
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}
const anchorCache = new Map();
async function anchorsOf(file) {
  if (anchorCache.has(file)) return anchorCache.get(file);
  const text = stripCode(await readFile(file, "utf8"));
  const counts = new Map();
  const set = new Set();
  for (const m of text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    let slug = slugify(m[1]);
    const n = counts.get(slug) || 0;
    counts.set(slug, n + 1);
    if (n) slug = `${slug}-${n}`;
    set.add(slug);
  }
  anchorCache.set(file, set);
  return set;
}

// Remove fenced code blocks and inline code so example syntax isn't mistaken for links.
function stripCode(text) {
  return text.replace(/^(```|~~~)[\s\S]*?^\1/gm, "").replace(/`[^`\n]*`/g, "");
}

async function checkLinks(mdFile) {
  const text = stripCode(await readFile(mdFile, "utf8"));
  for (const m of text.matchAll(/\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = m[2];
    if (/^(https?:|mailto:|tel:)/i.test(target)) continue;
    if (target.includes("\\")) { err(mdFile, `link uses backslashes: ${target}`); continue; }
    const [filePart, anchor] = target.split("#");
    const resolved = filePart ? path.resolve(path.dirname(mdFile), decodeURIComponent(filePart)) : mdFile;
    if (!(await exists(resolved))) { err(mdFile, `broken link: ${target}`); continue; }
    if (anchor && resolved.endsWith(".md")) {
      const anchors = await anchorsOf(resolved);
      if (!anchors.has(anchor)) err(mdFile, `missing anchor #${anchor} in ${rel(resolved)}`);
    }
  }
}

async function checkSkill(skillDir) {
  const skillMd = path.join(skillDir, "SKILL.md");
  const dirName = path.basename(skillDir);
  const text = await readFile(skillMd, "utf8");
  const fm = parseFrontmatter(text);
  if (fm.error) { err(skillMd, fm.error); return; }
  const { data, bodyStart, lines } = fm;

  for (const key of Object.keys(data)) {
    if (!ALLOWED_KEYS.has(key)) err(skillMd, `frontmatter key "${key}" is rejected by claude.ai uploads and the Skills API (allowed: ${[...ALLOWED_KEYS].join(", ")})`);
  }
  const name = data.name;
  if (typeof name !== "string" || !name) err(skillMd, "missing name");
  else {
    if (name.length > 64) err(skillMd, `name longer than 64 characters (${name.length})`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) err(skillMd, `name "${name}" must be lowercase letters, digits and single hyphens, not starting or ending with a hyphen`);
    if (name !== dirName) err(skillMd, `name "${name}" must match its directory "${dirName}"`);
    if (/anthropic|claude/.test(name)) err(skillMd, `name must not contain reserved words "anthropic" or "claude"`);
  }
  const desc = data.description;
  if (typeof desc !== "string" || !desc.trim()) err(skillMd, "missing description");
  else {
    if (desc.length > 1024) err(skillMd, `description is ${desc.length} characters (max 1024)`);
    if (/[<>]/.test(desc)) err(skillMd, "description must not contain < or > (rejected on upload)");
    if (/^(I |You )/.test(desc)) warn(skillMd, "description should be written in the third person");
  }
  if (data.compatibility && data.compatibility.length > 500) err(skillMd, "compatibility longer than 500 characters");

  const bodyLines = lines.length - bodyStart;
  if (bodyLines >= 500) err(skillMd, `SKILL.md body has ${bodyLines} lines (keep under 500)`);

  const files = await walk(skillDir);
  const skillMds = files.filter((f) => path.basename(f) === "SKILL.md" && !rel(f).includes("/evals/"));
  if (skillMds.length !== 1) err(skillDir, `found ${skillMds.length} SKILL.md files (expected exactly 1)`);

  // One level deep: supporting docs should be linked directly from SKILL.md.
  const linked = new Set([...stripCode(text).matchAll(/\]\(([^)#\s]+)/g)].map((m) => path.resolve(skillDir, m[1])));
  for (const f of files) {
    const r = path.relative(skillDir, f).split(path.sep).join("/");
    if (/^(references|templates|examples)\//.test(r) && !linked.has(path.resolve(f))) warn(f, "not linked directly from SKILL.md");
    if (!f.endsWith(".md") && !f.endsWith(".html") && !f.endsWith(".mjs") && !f.endsWith(".json")) warn(f, "unexpected file type in skill");
  }

  // Backtick paths mentioned in SKILL.md.
  for (const m of text.matchAll(/`((?:scripts|references|templates|examples)\/[^`\s]+)`/g)) {
    if (!(await exists(path.join(skillDir, m[1])))) err(skillMd, `mentions missing file ${m[1]}`);
  }

  for (const f of files) {
    if (f.endsWith(".md")) {
      const t = await readFile(f, "utf8");
      const n = t.split(/\r?\n/).length;
      if (rel(f).includes("/references/") && n > 100 && !/^##\s+Contents/m.test(t.split(/\r?\n/).slice(0, 15).join("\n"))) warn(f, `${n} lines without a "## Contents" section near the top`);
      if (/\bTODO\b|\bTBD\b|lorem ipsum/i.test(t)) err(f, "contains TODO, TBD or lorem ipsum");
      if (!t.trim()) err(f, "empty file");
    }
    if (f.endsWith(".json")) { try { JSON.parse(await readFile(f, "utf8")); } catch (e) { err(f, `invalid JSON: ${e.message}`); } }
  }
  return { name, descLength: desc?.length || 0, bodyLines, files: files.length };
}

async function checkEvals(skillNames) {
  const evalsFile = path.join(REPO, "evals", "evals.json");
  if (!(await exists(evalsFile))) { warn(REPO, "evals/evals.json not found"); return null; }
  let data;
  try { data = JSON.parse(await readFile(evalsFile, "utf8")); } catch (e) { err(evalsFile, `invalid JSON: ${e.message}`); return null; }
  if (!skillNames.includes(data.skill_name)) err(evalsFile, `skill_name "${data.skill_name}" does not match a skill`);
  const ids = new Set();
  for (const ev of data.evals || []) {
    const where = `case ${ev.id ?? "?"} (${ev.name ?? "unnamed"})`;
    if (!Number.isInteger(ev.id)) err(evalsFile, `${where}: id must be an integer`);
    if (ids.has(ev.id)) err(evalsFile, `${where}: duplicate id`);
    ids.add(ev.id);
    for (const field of ["name", "prompt", "expected_output"]) if (typeof ev[field] !== "string" || !ev[field].trim()) err(evalsFile, `${where}: missing ${field}`);
    for (const field of ["expectations", "unacceptable", "success_criteria"]) if (!Array.isArray(ev[field]) || !ev[field].length) err(evalsFile, `${where}: ${field} must be a non-empty array`);
    if (!ev.anchors || !["0", "1", "2", "3"].every((k) => typeof ev.anchors[k] === "string")) err(evalsFile, `${where}: anchors must define 0, 1, 2 and 3`);
    for (const f of ev.files || []) if (!(await exists(path.join(REPO, f)))) err(evalsFile, `${where}: missing fixture ${f}`);
  }
  const triggerFile = path.join(REPO, "evals", "trigger-evals.json");
  let pos = 0, neg = 0;
  try {
    const t = JSON.parse(await readFile(triggerFile, "utf8"));
    for (const q of t) {
      if (typeof q.query !== "string" || typeof q.should_trigger !== "boolean") err(triggerFile, `bad entry: ${JSON.stringify(q).slice(0, 80)}`);
      else if (q.should_trigger) pos++; else neg++;
    }
  } catch (e) { err(triggerFile, `cannot read: ${e.message}`); }
  return { cases: (data.evals || []).length, pos, neg };
}

// ---- run ----
const skillsRoot = path.join(REPO, "skills");
const skillDirs = [];
for (const e of await readdir(skillsRoot, { withFileTypes: true })) {
  if (e.isDirectory() && (await exists(path.join(skillsRoot, e.name, "SKILL.md")))) skillDirs.push(path.join(skillsRoot, e.name));
}
if (!skillDirs.length) err(skillsRoot, "no skills found");
const summaries = [];
for (const d of skillDirs) summaries.push(await checkSkill(d));

const mdFiles = (await walk(REPO)).filter((f) => f.endsWith(".md"));
for (const f of mdFiles) await checkLinks(f);
const evals = await checkEvals(summaries.map((s) => s?.name));

for (const s of summaries.filter(Boolean)) console.log(`skill ${s.name}: description ${s.descLength}/1024 chars · SKILL.md body ${s.bodyLines} lines · ${s.files} files`);
if (evals) console.log(`evals: ${evals.cases} behavioural cases · trigger queries ${evals.pos} positive / ${evals.neg} negative`);
console.log(`markdown files link-checked: ${mdFiles.length}`);
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s).` : `\nOK: 0 errors, ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
