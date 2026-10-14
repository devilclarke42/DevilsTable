# Testing

**Audience:** developers, QA reviewers and GMs recording release acceptance. **Purpose:** separate automated evidence from live compatibility claims.

## Automated checks

Use Node 20+ (CI uses 24), Python 3 for the HTML regression helper, and zip/unzip for packaging. No npm dependencies are required.

```sh
npm run check
npm run package
```

Checks cover documentation links/references, source/schema/identity validation, manifest consistency, runtime files/imports, JavaScript syntax, build convergence, native transfer/recovery, visibility, services, UI contexts and optional adapters. Tests use model doubles and do not certify live Foundry/Forge behaviour. Preserve historical regression fixtures even when their old candidate data is no longer shipped.

For ID history, pass a known full base commit SHA to `node tools/validate-data.mjs <base-sha>`. CI does this against the push/PR base. Packaging verifies its runtime allowlist and exactly one manifest; tests/tools/archive are not installed runtime content.

## Live acceptance matrix

Use a backed-up disposable Foundry 14 / D&D5e 5.3.3 world and record exact builds/modules/browser/host.

| Area | Verify |
| --- | --- |
| Installation | Restart/reconnect; enable module; source metadata loads without partial startup |
| Builds | Preview and build each catalogue/profile; repeat with unchanged IDs; protect user documents |
| Entry and permissions | NPC conversion/menu/tab, linked-token access, GM-only Actor and player UI |
| Stock and cash | Every preset, settlement/prosperity scaling, previews, existing/sold-out preservation, float replacement |
| Native Items | Containers, weapons/armour/tools/ammunition, potion actions/dose/healing and mundane uses |
| Trading | Buy/sell/mixed/services-only, finite/infinite settings, revised consent and explicit rejection |
| Concurrency | Two players compete for the last item; only one approved transfer; verify GM handover/reconnect |
| Recovery | Interrupted writes and conflicting edits; inspect receipts; compensate/recover without repeat payment |
| Interactions | Negotiation/theft suggestions versus GM decision; private DCs; one native roll |
| Restricted offers | Two PCs with different memory, manual reveals, disabled/ineligible services, stale/forged basket rejection |
| Integrations | Missing/disabled/opted-out modules, room key/notes, shared doors, expiry/manual recovery and no replay |
| UI | Keyboard, narrow windows, theme contrast, scrolling, search focus and preserved basket/drafts |

## Build and source regression review

Confirm renames/economic edits retain UUIDs; unmanaged/foreign data survives; managed collisions/type drift fail before writes; partial builds relock and converge; Actor imports remain independent. Legacy cleanup must protect known references and require a new preview after interruption. Never weaken read-back validation to hide a native schema mismatch.

## Evidence record

For each result, record source commit, module version, Foundry build, D&D5e version, enabled integrations, host/browser, date, steps and observed result. Redact private campaign data. A passing mock test or generated ZIP is not a live screenshot, certification or public release.

Milestone closure retains the current evidence summary in [Known Limitations](KNOWN_LIMITATIONS.md). The owner confirmed Fence generation in the live Merchant Builder; other unverified areas remain explicit release gates.

## Related documents

[Release Process](RELEASE_PROCESS.md), [Integrations](INTEGRATIONS.md), [Architecture](ARCHITECTURE.md).
