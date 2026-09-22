import { readFile, access } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { loadCatalogue } from "../scripts/data/catalogue-loader.js";
import { validateCatalogue } from "../scripts/validation/catalogue-validator.js";
import { catalogueEntryToItem } from "../scripts/builders/item-factory.js";
import { ROOT, listFiles, runtimeFiles } from "./files.mjs";

const readJson = async path => JSON.parse(await readFile(resolve(ROOT, path), "utf8"));
const assert = (ok, message) => { if (!ok) throw new Error(message); };

try {
  const catalogue = await loadCatalogue({ readJson });
  const report = validateCatalogue(catalogue);
  for (const error of report.errors) console.error(`${error.path}: ${error.message}`);
  assert(report.valid, `Catalogue failed with ${report.errors.length} error(s).`);
  const manifest = await readJson("module.json");
  const pkg = await readJson("package.json");
  assert(manifest.id === "devils-table", "Unexpected module identity.");
  assert(/^[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?$/.test(manifest.version), "Invalid module version.");
  assert(manifest.version === pkg.version, "package.json and module.json versions differ.");
  assert(manifest.compatibility.minimum === "14" && manifest.compatibility.maximum === "14", "Foundry target must remain V14 until reviewed.");
  const system = manifest.relationships.systems.find(s => s.id === "dnd5e");
  assert(system?.compatibility.minimum === "5.3.3" && system?.compatibility.maximum === "5.3.3", "D&D5e target must remain 5.3.3 until reviewed.");
  assert(!manifest.packs?.length, "Generated world compendiums must not be bundled in this framework release.");
  for (const path of [...manifest.esmodules, ...manifest.styles, ...await runtimeFiles()]) await access(resolve(ROOT, path));
  const sourceFiles = await listFiles(resolve(ROOT, "data/items"));
  const registered = new Set(catalogue.index.files.map(file => resolve(ROOT, file)));
  for (const path of sourceFiles.filter(file => file.endsWith(".json"))) assert(registered.has(path), `Unregistered catalogue file: ${path}`);

  for (const { item } of catalogue.entries) {
    const generated = catalogueEntryToItem(item);
    assert(generated.system.source.rules === "2014", `Incorrect rules baseline: ${item.id}`);
    assert(generated.system.weight.value === item.weight.value, `Weight conversion changed ${item.id}`);
    if (item.icon.startsWith("modules/devils-table/")) await access(resolve(ROOT, item.icon.slice("modules/devils-table/".length)));
  }
  // Syntax-check all JS without executing Foundry globals; verify relative imports exist.
  for (const dir of ["scripts", "tools", "tests"]) {
    for (const path of (await listFiles(resolve(ROOT, dir))).filter(file => /\.(m?js)$/.test(file))) {
      const syntax = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
      assert(syntax.status === 0, syntax.stderr || `Syntax check failed: ${path}`);
      const source = await readFile(path, "utf8");
      for (const match of source.matchAll(/(?:from\s+|import\s*)["'](\.[^"']+)["']/g)) {
        const target = resolve(dirname(path), match[1]);
        assert(target.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep), `Import escapes project: ${target}`);
        await access(target);
      }
    }
  }
  // Optional immutable-ledger check against the previous Git revision (used by CI).
  if (process.argv[2]) {
    const base = process.argv[2];
    assert(/^[a-f0-9]{40}$/.test(base), "Baseline must be a full Git commit SHA.");
    const check = spawnSync("git", ["rev-parse", "--verify", `${base}^{commit}`], { cwd: ROOT, encoding: "utf8" });
    assert(check.status === 0, "Baseline commit is unavailable; fetch history before validating.");
    const tree = spawnSync("git", ["ls-tree", "--name-only", base, "data/id-ledger.json"], { cwd: ROOT, encoding: "utf8" });
    assert(tree.status === 0, "Cannot inspect the baseline tree.");
    if (tree.stdout.trim()) {
      const prior = spawnSync("git", ["show", `${base}:data/id-ledger.json`], { cwd: ROOT, encoding: "utf8" });
      assert(prior.status === 0, "Cannot read the baseline ID ledger.");
      const previous = JSON.parse(prior.stdout);
      const currentIds = new Set(catalogue.ledger.ids);
      for (const id of previous.ids) assert(currentIds.has(id), `Permanent ID removed from the ledger: ${id}`);
    }
  }
  for (const warning of report.warnings) console.warn(`Note: ${warning}`);
  console.log(`Validated ${report.count} production items, manifest, runtime files, imports and JavaScript syntax.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
