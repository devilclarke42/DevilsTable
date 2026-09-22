import { readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("../", import.meta.url));
export const RUNTIME_FILES = ["module.json", "README.md", "CHANGELOG.md", "ROADMAP.md"];
export const RUNTIME_DIRS = ["scripts", "data", "schemas", "templates", "styles", "docs", "assets"];

export async function listFiles(directory, { optional = false } = {}) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (optional && error.code === "ENOENT") return []; throw error; }
  const result = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not allowed in packaged content: ${path}`);
    if (entry.isDirectory()) result.push(...await listFiles(path));
    else if (entry.isFile()) result.push(path);
  }
  return result.sort();
}

export async function runtimeFiles() {
  const files = RUNTIME_FILES.map(file => resolve(ROOT, file));
  for (const dir of RUNTIME_DIRS) files.push(...await listFiles(resolve(ROOT, dir), { optional: dir === "assets" }));
  return files.map(file => relative(ROOT, file).replaceAll("\\", "/")).sort();
}
