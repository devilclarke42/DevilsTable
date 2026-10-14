# Contributing

**Audience:** first-time and returning contributors. **Purpose:** explain how to submit reviewable changes.

## Start here

Read [Project Philosophy](docs/PROJECT_PHILOSOPHY.md), [Developer Guide](docs/DEVELOPER_GUIDE.md) and [Known Limitations](docs/KNOWN_LIMITATIONS.md). Content authors should also read [Content Standard](docs/CONTENT_STANDARD.md), [Price Guide](docs/PRICE_GUIDE.md), [Weight Guide](docs/WEIGHT_GUIDE.md) and [Icon Standard](docs/ICON_STANDARD.md).

Original project material has no selected distribution license yet. Do not assume an open-source grant or introduce a license/header on the owner's behalf. Third-party notices must be retained; see [Source Notices](docs/SOURCE_NOTICES.md).

## Submit a change

1. Check existing issues and explain substantial proposals before changing architecture.
2. Create a branch with a focused scope. Preserve permanent IDs, saved collection names and UUIDs.
3. Edit canonical source data or code; update the one authoritative guide for changed behaviour.
4. Run `npm run check`, including the documentation checks. Add meaningful regression coverage for changed behaviour; documentation-only edits do not need runtime tests that mirror text.
5. For runtime/content changes, verify the relevant workflow in a disposable supported world and record what was actually tested.
6. Open a pull request describing the problem, resulting behaviour, validation and remaining limitations. Do not merge an unverified release claim or publish artifacts as a stable release.

## Coding and content conventions

Use ES modules, relative imports, explicit validation and native Foundry documents. Keep calculation/data logic separate from UI and world mutation. Put optional-module knowledge in integration adapters. Avoid new npm/runtime dependencies unless they solve an established need.

Use lowercase kebab-case for data/code/template paths; permanent Markdown guides use uppercase underscore names. New product records require reserved IDs, complete sale units, honest sources and supported native mechanics. Do not duplicate a product to share it across merchants.

## Report a defect

Include module, Foundry and D&D5e versions; hosting environment; enabled integrations; GM/player role; steps to reproduce; expected/actual result; and a relevant redacted console error or receipt status. Do not post credentials, private campaign notes or unredacted player information. For interrupted trades, inspect/recover before retrying payment.

## Review expectations

Source and documentation should tell the same story. Automated tests do not prove live compatibility, artwork rights or campaign balance. Keep temporary investigation notes outside permanent guides; useful decisions belong in the relevant permanent document. See [Release Process](docs/RELEASE_PROCESS.md) before changing a release version.
