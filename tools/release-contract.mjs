/** Single distribution convention used by validation, packaging and publishing. */
export const REPOSITORY = "devilclarke42/DevilsTable";
export const INSTALLER_MANIFEST = `https://raw.githubusercontent.com/${REPOSITORY}/main/module.json`;
export function releaseContract(manifest) {
  if (!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(manifest.version)) throw Error("Invalid release version.");
  const tag = `v${manifest.version}`, filename = `devils-table-v${manifest.version}.zip`;
  const download = `https://github.com/${REPOSITORY}/releases/download/${tag}/${filename}`;
  if (manifest.id !== "devils-table-merchants" || manifest.manifest !== INSTALLER_MANIFEST || manifest.download !== download) throw Error("Installer URLs must match the selected version and alpha channel.");
  if (manifest.compatibility?.verified !== "14" || manifest.relationships?.systems?.find(s=>s.id==="dnd5e")?.compatibility?.verified !== "5.3.3") throw Error("Release compatibility must include the tested Foundry and D&D5e versions.");
  return {tag, filename, download, manifest:INSTALLER_MANIFEST};
}
