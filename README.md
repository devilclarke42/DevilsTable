# Devil's Table: Trade & Merchants

Persistent NPC shops and GM-approved trading for Foundry VTT and D&D5e.

Devil's Table is for GMs who want merchants with believable stock, native currency, individual customer relationships and a single workflow for goods and services. Players shop through a dedicated interface while the merchant Actor and private business records remain GM-only.

## Project status

**Milestone 1: Merchant Framework complete.** The current runtime is `0.3.0-alpha.29`, targeting **Foundry VTT 14**, **D&D5e 5.3.3** and **2014 rules**. Milestone 2 covers content expansion and public beta preparation. This is an alpha project, not a certified public beta; see [Known Limitations](docs/KNOWN_LIMITATIONS.md).

The source contains 440 unique products, 40 service definitions, 26 merchant templates and 100 active stock tables. Shared goods keep one identity across merchant types.

## Key features

- General Stores, Taverns, Blacksmiths, Alchemists and Fences use one merchant framework.
- Persistent NPC inventory; finite or infinite merchant funds; native D&D5e currency.
- Goods and services in one basket, with GM approval, revised-offer consent and private transaction history.
- Per-character pricing and trading memory, GM-reviewed negotiation and theft.
- Public, manually revealed and relationship-restricted offers.
- Editable merchant presets, settlement/prosperity-aware stock generation and cash previews.
- JSON-authored products with explicit sale units, project prices and adjusted weights.
- Optional room keys, calendar notes and local dice presentation through isolated integrations.

## Installation

In Foundry Setup → Add-on Modules → Install Module, paste this manifest URL:

```text
https://raw.githubusercontent.com/devilclarke42/DevilsTable/main/module.json
```

Foundry follows the manifest's version-specific download URL and uses the same manifest for Update checks. The current alpha targets Foundry 14 / D&D5e 5.3.3; verified metadata reflects the owner's target-world testing, while broader live acceptance remains pending.

Alternatively, download the versioned module ZIP from GitHub Releases and install manually or through The Forge's custom-module ZIP upload. Use a backed-up world; restart/reconnect after installation. GitHub source archives are not packaged module ZIPs.

Publishing happens after a versioned manifest change merges into main and the alpha installer workflow validates, builds, uploads and verifies both assets. A newly merged version is installable only after that workflow succeeds. This alpha channel is not the public beta.

## Quick start

1. As GM, open module settings and build the **Master Item Catalogue** and **Merchant Stock RollTables**. Preview, review and confirm each build.
2. Right-click a world NPC in the Actors sidebar and choose **Convert to Merchant**.
3. Apply a preset in Merchant Builder, review Setup, then **Save / Convert NPC**.
4. Generate Stock and Cash previews; inspect the assortment and apply explicitly. Review Services and any visibility or room settings.
5. Keep the NPC Actor GM-only, use a linked scene token and set the merchant Open. Players select a nearby owned character and right-click the merchant token to shop.
6. The active GM reviews checkout. Changed terms require player acceptance before settlement.

Rebuilding catalogues updates generated compendiums, not existing Actor inventory. Stock generation preserves existing product identities. See [Builder Guide](docs/BUILDER_GUIDE.md) and [Merchant Guide](docs/MERCHANT_GUIDE.md).

## Documentation

The [documentation index](docs/README.md) routes GMs, content authors and developers to the appropriate guide. Start with:

| Goal | Guide |
| --- | --- |
| Configure and run shops | [Merchant Guide](docs/MERCHANT_GUIDE.md) |
| Build catalogues and generate merchants | [Builder Guide](docs/BUILDER_GUIDE.md) |
| Understand design principles | [Project Philosophy](docs/PROJECT_PHILOSOPHY.md) |
| Work on the code | [Developer Guide](docs/DEVELOPER_GUIDE.md) |
| Add products | [Content Standard](docs/CONTENT_STANDARD.md) |
| Extend the module | [Public API](docs/API_REFERENCE.md) |
| Validate and package a release | [Release Process](docs/RELEASE_PROCESS.md) |

## Integrations

**Lock & Key** supports configured room keys and access expiry; **Calendaria** supports private rental notes; **Dice So Nice** provides local negotiation/theft roll presentation. Missing or disabled optional modules do not prevent ordinary trading. See [Integrations](docs/INTEGRATIONS.md) for configuration and compatibility evidence.

## Roadmap and contributing

See the [milestone roadmap](ROADMAP.md), [changelog](CHANGELOG.md) and [contributing guide](CONTRIBUTING.md). Small fixes, documentation and reviewed content are welcome. Before proposing a new framework subsystem, read the [project philosophy](docs/PROJECT_PHILOSOPHY.md).

## License and attribution

A distribution license for original project code, writing and artwork has **not yet been selected**. Public repository access does not establish an open-source license. Third-party material retains its own notices; see [Source Notices](docs/SOURCE_NOTICES.md). License selection and provenance review remain public-beta release gates.
