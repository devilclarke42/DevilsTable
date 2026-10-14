# Release Process

**Audience:** maintainers and release reviewers. **Purpose:** produce traceable candidates and define public-release gates.

## Version and scope

The repository is the release source. Current runtime version is declared in `module.json` and `package.json`; they must match. Semantic versions with alpha prerelease identifiers represent candidates, not stable releases. Milestone numbering is planning, not SemVer.

A documentation-only closure may keep the runtime version unchanged; identify its source commit to distinguish the package. Runtime/content changes need an appropriate new candidate version. After stable releases, use patch/minor/major versions according to compatibility; never overwrite published assets/tags to hide a correction. Review pre-1.0 migrations explicitly.

## Source and documentation checks

1. Review [Project Philosophy](PROJECT_PHILOSOPHY.md), the [Roadmap](../ROADMAP.md) and the exact scope.
2. Run `npm run check` and the permanent-ID history check against a known base SHA.
3. Confirm source, guides and public API describe implemented behaviour; update the single root changelog.
4. Review economics, text, source rights, icon suitability and license notices. Automation does not establish those rights or editorial quality.
5. Confirm no temporary notes, screenshots, secrets, prebuilt pack databases or unnecessary dependencies enter runtime packaging.

## Supported-world acceptance

Use a disposable/backed-up Foundry 14 / D&D5e 5.3.3 world with one active-GM tab and player clients. Follow [Testing](TESTING.md), including upgrades, repeat builds, mixed checkout, last-item concurrency, recovery and optional integration absence/failure. Record exact environment, commit and observed results. Do not widen manifest verification claims based only on automated tests.

## Package

```sh
npm run package
```

This validates/tests, stages the allowlisted runtime, creates `dist/devils-table-v<version>.zip` and verifies archive entries/manifest. `scripts/`, data/schemas, templates/styles, runtime assets and permanent documentation are included. Developer tools/tests, Git internals, generated output and historical provenance archive are excluded.

Artwork generation utilities remain in source for reproducibility; only optimized runtime assets ship. Existing world compendiums are generated outputs, not package input. CI uploads testable artifacts and does not publish a release automatically.

## Public beta gates

Before publishing an installation release, resolve the owner-selected distribution license and retain required attribution. Complete the reviewed live acceptance matrix, upgrade guidance, support/issue workflow and compatibility policy. Establish real release assets and a hosted manifest before advertising an installer/updater URL. A public source repository is not automatically a licensed open-source release.

Keep a versioned asset, source commit, checks and acceptance record together. Do not bundle private world data or imply that template documentation is a live compatibility report. See [Source Notices](SOURCE_NOTICES.md) and [Known Limitations](KNOWN_LIMITATIONS.md).
