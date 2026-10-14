import { readFile } from "node:fs/promises";
import { resolve, dirname, relative, sep } from "node:path";
import { ROOT, listFiles } from "./files.mjs";

const docs = ["README.md", "CONTRIBUTING.md", "ROADMAP.md", "CHANGELOG.md",
  ...(await listFiles(resolve(ROOT, "docs"))).filter(p => p.endsWith(".md")).map(p => relative(ROOT, p))];
const files = new Set((await listFiles(ROOT)).map(p => resolve(p)));
const errors = [];
const text = new Map();
const stripFences = source => source.replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, "");
const slug = heading => heading.replace(/<[^>]*>/g, "").replace(/[`*_~]/g, "").toLowerCase()
  .replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/ /g, "-");
const anchors = source => {
  const seen = new Map(), result = new Set();
  for (const match of stripFences(source).matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const id = slug(match[1]), count = seen.get(id) ?? 0;
    result.add(id + (count ? `-${count}` : "")); seen.set(id, count + 1);
  }
  return result;
};
for (const doc of docs) text.set(resolve(ROOT, doc), await readFile(resolve(ROOT, doc), "utf8"));
for (const doc of docs) {
  const source = stripFences(text.get(resolve(ROOT, doc)));
  const links = [...source.matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/g)].map(m => m[1]);
  links.push(...[...source.matchAll(/^\[[^\]]+\]:\s*(\S+)/gm)].map(m => m[1]));
  for (const link of links) {
    const target = link.trim().replace(/^<|>$/g, "").split(/\s+["']/)[0];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)) continue;
    const [path, fragment] = target.split("#", 2);
    const dest = !path ? resolve(ROOT, doc) : path.startsWith("/") ? resolve(ROOT, path.slice(1)) : resolve(ROOT, dirname(doc), decodeURIComponent(path));
    if (!dest.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) { errors.push(`${doc}: link escapes repository: ${target}`); continue; }
    if (!files.has(dest)) { errors.push(`${doc}: missing link target: ${target}`); continue; }
    if (fragment && dest.endsWith(".md")) {
      const content = text.get(dest) ?? await readFile(dest, "utf8");
      if (!anchors(content).has(decodeURIComponent(fragment))) errors.push(`${doc}: missing heading: ${target}`);
    }
  }
  // Backticked full documentation paths are also meaningful local references.
  for (const m of source.matchAll(/`(docs\/[\w/-]+\.md)`/g)) {
    if (!files.has(resolve(ROOT, m[1]))) errors.push(`${doc}: missing documented path: ${m[1]}`);
  }
}
for (const base of ["data", "tests/fixtures"]) {
  for (const path of (await listFiles(resolve(ROOT, base))).filter(p => p.endsWith(".json"))) {
    const source = await readFile(path, "utf8");
    for (const m of source.matchAll(/docs\/[A-Za-z0-9_/-]+\.md/g)) {
      if (!files.has(resolve(ROOT, m[0]))) errors.push(`${relative(ROOT, path)}: missing provenance document: ${m[0]}`);
    }
  }
}
if (errors.length) {
  for (const error of [...new Set(errors)]) console.error(error);
  process.exitCode = 1;
} else console.log(`Validated ${docs.length} Markdown documents, internal links/headings and provenance references.`);
