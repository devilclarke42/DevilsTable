# Integration developer contract

All external-module knowledge lives under `scripts/integrations/` or in an adapter registered through the public API. Merchant Services import the Integration Manager, never external modules. There are no required-module manifest relationships.

## Register an adapter

Register during Foundry `setup`, after Devil's Table has created its API at `init`. Adapter IDs are unique lowercase slugs. The manager detects the module and its active state before invoking `available()`.

```js
Hooks.once("setup", () => {
  game.modules.get("devils-table")?.api?.registerIntegration({
    id: "example-tools",
    name: "Example Tools",
    moduleId: "example-tools",
    available: () => typeof game.modules.get("example-tools")?.api?.performService === "function",
    actions: {
      "perform-service": async ({ job, character, merchant, record, receipt }) => {
        const result = await game.modules.get("example-tools").api.performService({
          actorUuid: character.uuid,
          merchantUuid: merchant.uuid,
          quantity: job.quantity,
          options: job.config,
          transactionId: record.id,
          receiptUuid: receipt.uuid
        });
        return { documentUuid: result.uuid };
      }
    }
  });
});
```

This example describes the adapter contract; it does not claim any such module exists. Future Convenient Effects, active-tile, Item Piles, calendar, quest or reputation adapters use the same boundary and are not included in this release.

Handlers must validate configuration, await all mutations and return small JSON-serializable results. Do not return Foundry documents or functions. Do not call the Integration Manager recursively from a handler: external actions share a serialized queue. If an upstream convenience API launches unawaited writes, use an officially supported awaitable alternative or isolate and document a reviewed schema-level fallback. Never patch another module's classes globally.

`integrationStatus()` returns installed/active/enabled/available states and reasons. Every registered adapter appears in the integration settings menu. Unknown adapters/actions are skipped at runtime, so content can remain installed without its enhancement module.

## Define ordered actions

A service definition can include:

```json
{
  "actions": [
    { "kind": "grantItem", "uuid": "Compendium.world.tokens.Item.example", "onFailure": "continue" },
    { "kind": "macro", "uuid": "Macro.example", "onFailure": "stop" },
    { "kind": "integration", "integration": "example-tools", "action": "perform-service", "config": { "mode": "standard" }, "onFailure": "continue" }
  ]
}
```

Merge these fields into a complete validated service definition; this fragment is not a complete service bundle. There are at most 20 authored actions. Native action UUIDs must resolve to the expected document type. Integration configuration is a bounded JSON object (16,000 serialized characters); the adapter owns its detailed schema. Inline JavaScript is not accepted in service definitions.

Supported native kinds are `macro`, `journal`, `rollTable`, `activeEffect` and `grantItem`. `integration` is the external dispatch kind. The existing `execution` map remains compatible and executes first. Avoid configuring the same side effect twice in both formats.

Currency settlement and receipt creation cannot be authored as repeatable actions. They run once in the transaction coordinator before fulfilment. Service modifiers and GM/player acceptance remain unchanged. A configured grant creates one physical Item document with the purchased service quantity, preserving its source data except document identity, ownership, folder and old parent-container reference. It does not recursively grant a container's contents.

## Accommodation capability

Set `accommodation: true` on a service definition to expose room configuration. The Builder validates a merchant-local room payload:

```json
{
  "name": "Willow Room",
  "doors": ["Scene.inn.Wall.first", "Scene.inn.Wall.second"],
  "keyName": "Willow Room Key",
  "expiry": "checkout",
  "days": 3,
  "key": true,
  "calendar": true
}
```

The merchant offer stores this as `room`; definitions remain reusable. `expiry` is `persistent`, `checkout` or `manual`. Door UUIDs are unique and bounded to 30. The schema accepts 1–365 integral nights (the compatibility field remains `days`). The service price covers that configured duration; there is no implicit multiplier. Capability and mappings are data, not a Tavern-specific code branch.

Enabled room choices compile into ordered `locknkey/room-key` and `calendaria/room-booking` actions after authored actions. All integrations still dispatch through the manager. Other providers may define different actions without changing Merchant Services.

## Failure, security and audit

The active GM executes jobs after the completed transaction is durable. An attempted marker is saved before every side effect. Results are saved afterward. Missing/inactive/opted-out/incompatible integrations return `skipped`; adapter exceptions return `needs-attention`. Default continuation allows later jobs to finish. `onFailure: stop` blocks remaining pending optional jobs, but cannot reverse an already committed trade.

Do not automatically replay attempted/failed jobs. A crash between a mutation and its final receipt save has an ambiguous outcome. Adapters with several writes must persist partial progress in a private, recoverable record. The room adapters use private booking journals with key/note references. Key revocation removes a unique rental grant and can be retried safely; key grants and note creation cannot.

Public browse responses explicitly omit `execution` and `actions`; prices and quantities are calculated on the GM. Booking journals use default ownership NONE. Macro/journal/table results and access mappings remain private. Do not route external-module calls through player-supplied prices, script strings or arbitrary method names.

The manager serializes adapter handlers across merchants on the active GM to avoid two rental operations overwriting a shared door's access list. Third-party direct edits remain outside that queue: coordinate manual edits with ongoing fulfilment and inspect any verification mismatch rather than replaying a trade.

## Source map

| File | Responsibility |
| --- | --- |
| `integrations/manager.js` | Registration, detection, opt-out, execution queue and exception boundary |
| `integrations/room.js` | Room validation and action compilation |
| `integrations/bookings.js` | Private lease/audit documents and world-time endpoints |
| `integrations/locknkey.js` | Key creation, multi-door grants and scoped revocation |
| `integrations/calendaria.js` | Public date conversion and private calendar-note creation |
| `integrations/lifecycle.js` | Adapter registration, GM checkout and overdue processing |
| `integrations/settings-app.js` | Status/preferences and booking recovery UI |
| `services/actions.js` | Generic ordered-action validation |
| `services/execution.js` | Native fulfilment and manager dispatch with durable attempt markers |

See [Integrations](INTEGRATIONS.md) for configuration, expiry semantics and the live compatibility checklist.

## Accommodation clock contract

`merchant.settings.checkoutTime` holds a merchant-owned HH:mm default; absence means `10:00`. Service definitions may declare `nights` (integer 1–365, only with `accommodation: true`), defaulting to one. A configured room's `days` takes precedence. This is term metadata, not inventory or a calendar copy.

Only trusted GM review edits can override `checkoutTime`. Public quote terms include nights and checkout time so revised-offer consent detects changes; private doors/actions remain excluded. Optional execution jobs carry the agreed time to `ensureBooking`. Existing bookings are returned untouched. New booking journals retain the agreed clock time and absolute endpoint for auditing and expiry.

The helper uses native [GameTime components](https://foundryvtt.com/api/v14/classes/foundry.helpers.GameTime.html) and [CalendarData.timeToComponents](https://foundryvtt.com/api/v14/classes/foundry.data.CalendarData.html). One night means the next calendar date, not a 24-hour interval. Calendar notes and rental access share one persisted endpoint. Day, month and year boundaries are handled through the native timestamp and calendar day length; real-world timezones are not involved.
