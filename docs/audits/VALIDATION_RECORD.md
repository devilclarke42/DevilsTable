# Milestone 2A Validation Record

**Audience:** maintainers and reviewers. **Purpose:** state exactly what the audit checked and where its conclusions stop.

## Baseline and method

- Main/default branch checked on GitHub: `d94d7fb68e52a80d0d03e7b4b46d4d5c463484eb`.
- Published `v0.3.29` release target matched this commit; release publication timestamp was 2026-10-14T10:08:12Z. No release edits were made.
- Dedicated branch `milestone-2a-catalogue-audit` started at this exact commit.
- Official SRD PDF downloaded from the URL recorded in each JSON file. SHA-256 recorded there to distinguish future replacements; no PDF binary or copied book is committed.
- Loaded indexed canonical JSON through the existing loader; generated Item/table plans through actual converters; extracted profile groups and used the actual Builder estimator.
- Every one of the 57 registered item files and every one of the 440 item records/40 services is represented in the inventory, with no runtime mutation.
- Compared all 37 SRD weapon damage/properties/proficiency/range/versatile mappings and all 13 armour/shield AC/category/Strength/Dexterity/Stealth mappings. No differences in those compared native fields. Read the Lance and Net special-rule descriptions; manual adjudication is documented.
- Reviewed all 241 selected source rows, exact/native type matches, unit aliases and explicitly labelled near matches. Source dash weights remain unspecified rather than assumed zero. Ammunition and piton price comparisons use per-piece normalization.
- Read the five potion definitions and compared healing progressions/action costs and climbing description with SRD pp. 233–234. Native rarity is absent; climbing effects remain manual.
- Checked canonical/document IDs, exact-name/description duplication, source paths, membership reachability, category usage and generated table links.
- Calculated 225 analytical scenarios: 25 profiles × three settlement sizes × three prosperity settings, explicitly selecting each stock profile on an empty merchant. These are estimator outputs, not live inventory rolls or a campaign census. Profile selection is held constant to isolate settlement/prosperity; the Builder may choose another default profile when the user changes configuration.

## Existing checks run

`npm run check` passed at the baseline: documentation/source validation and all **412 regression tests**. Final documentation validation and audit JSON integrity checks also passed after writing these files. No tests or permanent analysis tooling were added.

The audit JSON checks verified:

- inventory IDs equal the exact set of source Item/service IDs, once each;
- all 241 source IDs are unique and all referenced canonical IDs exist;
- denominators, represented counts and status totals recompute correctly;
- all price/weight comparisons use current source values;
- inventory price, weight, sale unit, icon, native type and source location match the baseline extraction;
- every current merchant membership is reachable in at least one appropriate profile;
- all 100 generated table IDs are unique and their document results resolve to current generated Item/table IDs;
- all local module Item icon files exist;
- all 25 stock profiles contain nine scenario rows, totalling 225;
- changes are confined to audit documentation and its navigation link. Released manifest/version, gameplay data, scripts, schemas, tests and workflows are unchanged.

## Interpretation limits

No actual campaign or Foundry server was attached. Installed compendium contents, old-ID namespace migration, optional module behaviour, UI rendering, asset appearance, actual currency transfers and multiplayer contention were not tested by this audit. Existing regression tests provide synthetic coverage, not new live acceptance.

393 Item core icon references match the maintained known-reference fixture; only the 47 module-local Item references were checked against files here. An installed core-library file-existence check and visual review remain recommended. The three book icons assigned to non-book curiosities were flagged from their semantic paths and source descriptions.

Source metadata and original-text labels were inventoried, not independently proven as a complete chain-of-title audit. Supplement content without established permission was quarantined as a proposed source family; no paywalled book content was copied. Original-project downstream licence selection is still pending. This record does not claim approval of any licence not already documented.

The 51.87% figure is **125/241 source-unit equipment presence**. It does not mean 51.87% of every SRD item/spell/service, nor that 125 entries all have exact official prices and native automation. The seven near matches are excluded consistently because their unit/capacity/function differs. Existing useful product variants remain present and were not changed.

## Related documents

[Catalogue Audit](CATALOGUE_AUDIT.md), [Coverage Matrix](CATALOGUE_COVERAGE.json), [Service Coverage](SERVICE_COVERAGE.md), [Testing](../TESTING.md).
