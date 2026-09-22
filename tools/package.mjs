import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { ROOT, runtimeFiles } from "./files.mjs";

const manifest = JSON.parse(readFileSync(resolve(ROOT, "module.json"), "utf8"));
if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?$/.test(manifest.version)) throw new Error("Invalid version.");
const staging = await mkdtemp(join(tmpdir(), "devils-table-package-"));
try {
  const files = await runtimeFiles();
  for (const path of files) {
    const target = resolve(staging, "devils-table", path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(ROOT, path), target);
  }
  const archive = resolve(staging, "module.zip");
  const zip = spawnSync("zip", ["-q", "-X", archive, "-@"], {
    cwd: staging, input: files.map(file => `devils-table/${file}`).join("\n") + "\n", encoding: "utf8"
  });
  if (zip.status !== 0) throw new Error(zip.error?.message || zip.stderr || "Install the zip command to build archives.");
  const verify = spawnSync("unzip", ["-Z1", archive], { encoding: "utf8" });
  if (verify.status !== 0) throw new Error("Archive verification failed; the unzip command is required.");
  const entries = verify.stdout.trim().split("\n");
  if (JSON.stringify(entries) !== JSON.stringify(files.map(file => `devils-table/${file}`))) throw new Error("Archive contents differ from the runtime allowlist.");
  if (entries.filter(file => file.endsWith("/module.json")).length !== 1) throw new Error("Archive must contain exactly one module manifest.");
  await mkdir(resolve(ROOT, "dist"), { recursive: true });
  const output = resolve(ROOT, "dist", `devils-table-v${manifest.version}.zip`);
  await copyFile(archive, output);
  console.log(`Packaged ${files.length} runtime files: ${output}`);
} finally {
  // Remove only the unique staging directory created by this invocation.
  await rm(staging, { recursive: true, force: true });
}
