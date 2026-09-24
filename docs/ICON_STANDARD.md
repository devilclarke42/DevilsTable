# Icon Standard

**Status:** official policy for icon selection, new artwork and release review.

Icons must be readable, consistent and inexpensive to load on The Forge. A catalogue with thousands
of items should reuse a compact visual library rather than ship thousands of nearly identical
pictures. A distinct item does not require a distinct icon.

## Selection order

1. Search the existing catalogue for a suitable referenced icon.
2. Check Foundry's supplied core icon library for a clear match.
3. Reuse a suitable module-owned asset.
4. Create a new module-owned asset only when no existing icon communicates the object adequately.

Core paths such as `icons/sundries/lights/candle-unlit-tan.webp` are references to Foundry's installed
library. Do not copy those files into the module merely to rename them. A file supplied by another
module or an external website is not a guaranteed core dependency.

Shared icons are already deliberate: Candle, Beeswax Candle and Tallow Candle use the same candle
icon; the rope variants share one rope icon; Tinderbox and Flint & Steel share one project image.
Keep this reuse unless a meaningful readability problem justifies a change. Minor differences in
quality, material, price, stock tier or merchant do not automatically justify another asset.

## New module-owned raster assets

| Property | Required standard |
| --- | --- |
| Format | Static WebP |
| Dimensions | Exactly 256×256 pixels |
| Composition | One recognisable object or coherent set, centrally framed with useful padding |
| Background | Transparent or visually quiet; use one consistent treatment within a new batch |
| Style | Grounded fantasy equipment, clear shapes, restrained texture and a muted material palette |
| Legibility | Recognisable at typical small inventory sizes, including 32×32 and 64×64 previews |
| Encoding | Smallest file that preserves legibility and clean transparency; avoid unused metadata |
| Size budget | Aim for 50 KiB or less; anything above 100 KiB needs a recorded reason and optimisation review |

Use a consistent viewing angle, object scale and lighting direction across newly authored batches.
Avoid text labels, numbers, watermarks, decorative token rings, strong coloured glows, dramatic
scenery or hard shadows that make an ordinary object read as magical. An icon should identify the
product, not advertise a mechanical benefit. Dark and light Foundry themes must both remain usable.

High-resolution editable masters may be kept outside the runtime asset folders. The installed
module receives the optimised 256×256 WebP, not the editor project, multiple exports or a 4K source.
Do not enlarge a poor source just to meet dimensions; review its readability and rights first.

## Paths and filenames

Module-owned runtime files live in `assets/icons/`, with lowercase descriptive kebab-case filenames.
Use the depicted subject rather than the first merchant's name, price or permanent item ID. This
makes the file reusable. Item JSON references the exact module-relative public path beginning
`modules/devils-table/assets/`. Paths are case-sensitive on the target host.

Permitted source roots are `icons/` and `modules/devils-table/assets/`. Remote URLs, data URLs,
absolute filesystem paths and traversal are prohibited. Only reference an asset after it exists
or has been verified in the supported Foundry core library. Changing a shared path requires checking
all references; replacing an image in place affects every Item using it.

## Deduplication and provenance

Before adding an icon, compare both filenames and appearance. Identical file hashes identify exact
duplicates; visually equivalent exports may still have different bytes, so a human comparison is
required. Prefer one neutral filename referenced by multiple Items. Do not retain unused copies
of the same artwork “just in case”.

For each new asset, record its path, creator/source, applicable rights, any adaptation and intended
shared use in the accompanying review documentation. If another source imposes attribution, retain
the exact required attribution in the appropriate release documentation. Do not infer permission
from an image being publicly accessible. The project's distribution licence remains a release gate;
an Item's `source.license` does not automatically establish artwork rights.

If an image-generation workflow is used, record that provenance honestly and review its output for
object accuracy, coherent construction, artefacts and consistency. The acceptance standard is the
same as for other artwork. Creation method is not a reason to add a duplicate or oversized file.

## Existing assets and compatibility

The accepted catalogue currently references core WebP assets and **15 original module-owned SVGs**.
Those SVGs are documented in [FILE_MAP.md](FILE_MAP.md) and the General Store review. They remain
valid legacy assets; this documentation-only sprint does not convert, replace or duplicate them.
Core assets are also consumed at their supplied dimensions and formats without repackaging.

The 256×256 WebP requirement applies to newly introduced module-owned raster icons. New work should
prefer the shared library and this raster standard. A future conversion of an existing SVG must be
a focused, reviewed change: replace references consistently, verify the packaged file, and retain
useful source artwork outside the runtime payload. Never leave both old and new runtime duplicates
without a compatibility reason.

The current schema accepts SVG, WebP, PNG, JPG and JPEG paths for compatibility. That broad schema
does not make every accepted format the preferred authoring standard. Current tooling checks
permitted paths and the existence of module-owned files; pixel dimensions, visual consistency,
byte budgets, deduplication and rights still require review.

## Acceptance checklist

- A suitable existing icon was considered before adding a file.
- Shared references are intentional and the image accurately depicts the sold object or set.
- A new raster file is 256×256 WebP, readable small and within the reviewed byte budget.
- The icon works on both light and dark backgrounds, with no accidental magical or mechanical cues.
- The source path is local, exact, correctly cased and present in the packaged runtime.
- Provenance and rights are recorded, and duplicate exports/editor files are absent from the ZIP.
- Importing and opening the Item on the supported Foundry/Forge environment renders the icon correctly.

Update the affected content review, [file inventory](FILE_MAP.md) and changelog when artwork changes.
Shared icon replacement is a user-visible catalogue change even when no permanent Item ID changes.
