# Repository Maintenance

**Audience:** maintainers reviewing long-term repository health. **Purpose:** keep documentation, references and packaged files understandable without accumulating temporary plans.

## Document lifecycle

Retain a guide when it has a distinct current audience and purpose. Merge useful knowledge into its authoritative guide before removing duplicate/temporary material. Archive evidence needed for source, artwork or accepted content decisions; mark it as historical and keep it out of runtime packaging. Git retains removed specifications and detailed development chronology.

Use [documentation index](README.md) as navigation, the root roadmap for direction and the root changelog for meaningful versioned changes. Do not recreate duplicate docs roadmaps/changelogs, project-state logs, pathway plans or file-by-file inventories that age faster than the code.

## Consolidation decisions

| Original material | Disposition and current home |
| --- | --- |
| General Store/Containers/expansion/Tavern reviews | Archived as source/asset evidence under `docs/archive/` |
| Merchant system specification, implementation roadmap, interaction/transaction plans and wireframes | Removed after durable behaviour was consolidated in Architecture, Merchant/Data Model and Testing guides |
| Design decisions and technical justification | Merged into Project Philosophy and Architecture |
| Merchant administration, identity and UX workflows | Merged into Builder/Merchant guides, Testing and Known Limitations |
| Tavern service guide | Merged into Tavern Guide; the technical service contract stays separate |
| Catalogue framework guide | Merged into Public API, Source Data and Architecture |
| Duplicate roadmap/changelog and project-state/file-map logs | Removed; root roadmap/changelog and Developer/Known Limitations guides are authoritative |
| Blacksmith source notices | Broadened to Source Notices without removing required attribution |
| Unused deferred Tavern stock policy | Removed; no runtime/test consumer remained |
| Referenced runtime templates/assets and artwork generators | Retained; generators preserve reproducibility |

The runtime `scripts/` layout and saved data/collection identifiers are retained. Renaming them solely to imitate another project's directory tree would add migration risk without clarity. Historical origin/compatibility terminology in permanent IDs and attribution is intentional.

## Reference and content checks

Run `npm run check`. Documentation validation checks relative Markdown links/anchors, references to local source documents and unresolved provenance paths. Source validation confirms local assets, imports, schemas and IDs. Check references across runtime, fixtures, docs and reproducible generators before removing an apparently unused file; dynamic registration and intentional regression inputs may not look like direct imports.

For moved provenance documents, update source.reference and icon fixtures while preserving source title/license, mechanics, prices, weights and permanent IDs. Historical hash comparisons explicitly normalize only those approved document-path moves.

## Packaging and release

Runtime ZIPs include permanent user/developer guides, Source Notices and contributing guidance. They exclude archived audits, tests, development tools, generated output and Git internals. Remove empty placeholders rather than implying an unimplemented pack/localisation subsystem. Documentation-only consolidation does not change runtime version or certify public-beta readiness.

Before milestone closure, inspect each remaining page for useful purpose, duplicated ownership, obsolete claims and navigable links. Read the repository as a first-time contributor: setup, standards, architecture, generation, extension contracts, limitations and release gates should all be discoverable.
