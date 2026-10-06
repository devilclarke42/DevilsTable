# Optional integrations

Sprint 10C · `0.3.0-alpha.10`

Devil's Table works without any other module. Integrations enhance paid services through one Integration Manager; they are not dependencies. Missing, disabled or incompatible modules produce a recorded skipped action and a GM notification. The ordinary service, payment, statistics and receipt still complete.

## Supported adapters

| Integration | Module ID | Implemented enhancement | Required capability |
| --- | --- | --- | --- |
| Lock & Key | `LocknKey` | Create a room key on the purchasing character; grant several configured doors; revoke rental access | `api.LnKFlags.KeyIDs` and `isLockable`, plus the reviewed access-code flag schema |
| Calendaria | `calendaria` | Private check-in and check-out calendar notes for accommodation | `CALENDARIA.api.createNote` and `timestampToDate` |

Open **Module Settings → Devil's Table → Manage Integrations / Room Bookings**. The panel distinguishes installed, enabled in Foundry, enabled within Devil's Table and API-ready states. Each integration can be disabled independently. Built-in integrations default to enabled within Devil's Table, but no external action happens until the GM configures an offering to use it. Reload the world after changing Foundry's enabled modules.

The adapters were reviewed against upstream sources on 29 September 2026:

- [Lock & Key API](https://github.com/Saibot393/LocknKey/blob/main/scripts/compatibility/APIHandler.js), [flag implementation](https://github.com/Saibot393/LocknKey/blob/main/scripts/helpers/LnKFlags.js) and [API guide](https://github.com/Saibot393/LocknKey/blob/main/wiki/api.md). The reviewed manifest reports **5.1.3**, verified for Foundry 14; repository tree `c3dbe3d66a7b5f2749e7cd714363e19c8c92df4c`.
- [Calendaria API](https://github.com/Sayshal/Calendaria/blob/main/scripts/api.mjs) and [note manager](https://github.com/Sayshal/Calendaria/blob/main/scripts/notes/note-manager.mjs), tree `841f73fabab802c85e7e03b5a4f7842c6a75d13c`. The development manifest declares Foundry 14 compatibility and has no release version string. Availability is capability-detected; no unverified release-version claim is made.

These are source/API checks and automated adapter tests, not a completed live Foundry compatibility certification.

## Configure accommodation

1. Configure the room's doors in Lock & Key first. Each must be a real scene Wall door marked lockable in that module. Devil's Table does not turn ordinary walls into doors, alter lock state or change lock difficulty.
2. Open Merchant Builder → **Services**. An accommodation-capable definition, such as Rent Private Room, shows **Service actions and accommodation**.
3. Enable **Configure this accommodation offering**. Enter the room name, each Wall document UUID on its own line, and an optional key-name override. UUID format: `Scene.sceneId.Wall.wallId`. UUIDs identify doors across scenes; names alone are ambiguous.
4. Choose a duration: One Night, Three Nights, One Week (seven days), or a custom integer from 1–365 days. The manual day field is always editable. Set the offering's base price to cover that configured period; choosing a duration does not silently multiply the price.
5. Choose key expiry behaviour, then enable the desired integration actions. Missing integrations remain visible but disabled with a reason. Existing saved choices are retained if a module later becomes unavailable, and execution skips them safely.
6. **Save Service Offerings**. Refresh the Shop and purchase the service using ordinary checkout and GM approval.

The `accommodation: true` definition capability enables this UI without hard-coding Tavern IDs into the Builder. Another catalogue can expose accommodation through data. Room mappings belong to individual merchant offerings, not shared catalogue definitions.

One key and one booking are created per purchased service line. Quantity is recorded and available to actions but does not duplicate keys, allocate additional rooms or extend the configured duration. For a group booking the GM decides who receives the key. This sprint does not introduce reservation conflict detection, room allocation, occupancy limits or capacity simulation. A common-room offering can therefore intentionally serve several customers.

## Payment and sequential actions

The transaction pipeline settles native D&D5e currency and transfers ordinary products once, then records the completed trade. Optional service actions follow sequentially. Their results are appended to the private receipt. **Deduct Currency** and **Record Transaction** are mandatory pipeline stages, not configurable actions that can run again.

A service may use the existing `execution` UUID map and/or the new ordered `actions` array. Legacy executions retain pre-payment document validation and run first. New optional actions resolve after payment:

| Action kind | Behaviour |
| --- | --- |
| `grantItem` | Create a physical source Item on the purchasing character; quantity equals purchased service quantity; clear old parent-container reference |
| `macro` | Run a GM-executable native Macro with Actor, merchant and service job context |
| `rollTable` | Draw privately and record the result |
| `journal` | Open the JournalEntry for the GM; do not share private journals automatically |
| `activeEffect` | Copy the referenced native effect to the purchaser |
| `integration` | Dispatch through the Integration Manager to a registered adapter/action |

Each job stores `attempted` before the side effect, then `completed`, `skipped` or `needs-attention`. A crash after an attempted marker does not cause automatic replay. Optional failures continue by default; `onFailure: "stop"` marks remaining optional jobs `blocked`. Skipping an unavailable integration is an expected fallback and does not invoke stop-on-failure. No post-payment action failure refunds or reruns a purchase. A GM inspects the receipt and booking rather than asking the customer to buy again.

Legacy macro hooks remain available. No macros are required for the built-in accommodation integrations. Use trusted macros only: arbitrary macro side effects cannot be transactionally reversed.

## Keys and expiry

Keys are real native loot Items, not fake service Items or duplicated catalogue entries. Their default name is `<Room Name> Key`; an override replaces it. A unique rental access code is appended to every configured door and assigned to the purchaser's key. Existing keys, access codes and lock states are preserved. External writes are serialized across merchants by the active GM.

Lock & Key's convenience creator and `linkKeyLock` do not return an awaitable result covering the created key and all writes in the reviewed source. The isolated adapter therefore creates the native Item directly, reads codes through `LnKFlags.KeyIDs`, and uses awaited writes to the reviewed `LocknKey.IDKeysFlag` field with read-back verification. No other core file reads or writes Lock & Key fields.

| Expiry policy | Behaviour |
| --- | --- |
| Persistent Key | Access remains after checkout. The GM can close the booking; the key and code remain intentional permanent access. |
| Expire on Checkout | Revoke at the scheduled world-time endpoint or explicit GM checkout, whichever happens first. |
| Manual Recovery | No timed revocation. Use the integration administration panel to check out and revoke explicitly. |

Revocation removes only the booking's unique door code, invalidating transferred or copied keys as well. It deletes the original key only when its rental marker still points to this booking. It never deletes unrelated Items or all keys matching a name. A missing original key does not prevent revoking the doors. Deleted doors are skipped because their access no longer exists.

Expiry uses Foundry world time, not wall-clock time. For new bookings, checkout defaults to **10:00**. Set each merchant's default in **Merchant Builder → Setup → Accommodation checkout time**, then save configuration. The GM Review window can override the time for that purchase only; Recalculate sends changed terms to the player for confirmation.

A one-night arrival at 20:00 checks out on the following calendar date at 10:00. Three nights end three dates after arrival at the selected clock time. Even an arrival before 10:00 counts its first night on the arrival date. Quantity does not multiply nights. Weekly lodging defaults to seven nights; an explicit room configuration overrides that duration.

The endpoint uses Foundry's native calendar clock components and day length. Enter HH:mm in the world's clock, not your real-world timezone. Nonstandard calendars require a time within their hour/minute bounds. Existing bookings keep their recorded endpoints when defaults change or the module upgrades. Calendaria is not required for this native key expiry. Moving time backward never reopens a closed lease. An active GM processes overdue rentals on ready and world-time changes.

If Lock & Key is disabled when expiry occurs, the booking is marked `needs-attention`; access cannot safely be changed until the integration is available. Re-enable it and use **Check Out / Recover Key**. Manual retry of revocation is idempotent; grants, macros and note creation are not automatically retried.

## Calendaria notes

The adapter creates a private check-in note spanning the rental period and a private check-out note at the endpoint. It uses Calendaria's public 1-based date conversion and note API, not private note flags. Notes are secret/GM-only, reference the merchant and purchaser and request GM reminders. They do not expose prices, private relationships, access codes or door mappings to players.

Calendaria supplies calendar presentation and reminders. The native booking endpoint drives key expiry; deleting a calendar note does not renew access. Closing early revokes access but preserves the original calendar notes as a record of the scheduled stay. No world-time advance, rest automation, future restocking, business-hours enforcement or availability reservations are implemented.

If note creation partially succeeds, the private booking records each returned note UUID. Inspect those references before creating missing notes manually. The system will not create duplicate notes by replaying an interrupted action.

## Storage and recovery

Room configuration is stored at `flags.devils-table.merchant.services.<serviceId>.room`. Each actual rental creates a GM-only world JournalEntry whose `flags.devils-table.booking` contains booking identity, merchant/character/service references, room configuration snapshot, start/end, policy and generated document references. This is an access lease and audit record, not a second inventory, wallet or Actor identity store.

Booking journals intentionally survive receipt-retention limits and merchant resets so active keys cannot become orphaned. Closed bookings remain available to the GM; their deletion is a deliberate native Journal action after access is resolved. Do not delete active booking journals. The integration panel lists open/attention bookings and exposes receipt, key and note references. Completed/skipped optional jobs follow normal receipt retention; unresolved jobs remain protected from ordinary trimming.

The active GM alone changes bookings and external modules. Door UUIDs, optional action configuration and results are excluded from player browse packets. Service purchases still require existing ownership, funds, approval and merchant-lock checks.

## Validation and live acceptance

Automated coverage includes missing/disabled modules, independent opt-outs, payment without integrations, key creation across multiple doors, private notes, custom day lengths, three expiry policies, partial failures, action ordering, stop/continue, no replay, shared-door concurrency, native Item grants and private projection. Existing two/three/five-player transaction tests remain part of the regression suite.

Before production use, test a backed-up Foundry V14 / D&D5e 5.3.3 world:

1. With neither module installed, buy an ordinary service and a configured integration service. Both must charge once and record; unavailable jobs should be skipped.
2. Enable Lock & Key and configure two locked doors with an existing working key. Rent a room. The purchaser receives one correctly named key; it must operate both configured doors, while the existing key still works.
3. Advance world time past checkout. The rental key and copied rental access must stop working; the existing key must still work. Test Persistent Key and Manual Recovery separately.
4. Disable Lock & Key before expiry, advance time, then re-enable it. Recover the booking from settings without repeating the purchase.
5. Enable Calendaria with an active calendar. Verify check-in/out dates, GM-only notes, reminders and a custom-duration rental. Repeat with a nonstandard day length.
6. Disable each integration independently. Confirm the other action still works. Simulate an invalid door and verify calendar action continuation and a private failure receipt.
7. Refresh/reconnect GM and player clients. Confirm ordinary mixed product/service trading, the inline catalogue icon and `Token Name - Business Name` window title.

## Tavern Completion defaults

New room configuration forms preselect supported integrations that are installed, active, enabled in Devil’s Table and API-compatible. This is a draft convenience, not an automatic world mutation. The GM enters room names and door references, reviews the actions and saves. Existing room choices, including opt-outs, remain unchanged. All optional actions still run through the Integration Manager after approved payment. Secure Storage and Package Holding do not issue room keys or move Items; Courier Message does not send messages.

## Dice So Nice

Module ID: `dice-so-nice`. When active and exposing `game.dice3d.showForRoll`, it presents native merchant negotiation/theft rolls on the rolling player's client. Devil's Table does not create a public chat roll or broadcast animation. Players see their total, while hidden DCs and decisions remain in GM review. No reroll or extra gameplay result is created.

Presentation defaults on and can be disabled in Devil's Table's Integration Settings. Missing APIs, disabled modules and animation failures fall back silently to the standard native result. Service integrations still require the active GM; player presentation is isolated in the Integration Manager's `clientActions` allowlist. Live animation testing remains part of [UX acceptance](UX_WORKFLOWS.md#live-acceptance).
