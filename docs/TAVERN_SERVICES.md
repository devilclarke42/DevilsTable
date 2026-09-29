# Tavern Services

Sprint 10B · `0.3.0-alpha.8` · 29 September 2026

## Philosophy

An inn sells hospitality as well as objects. Services pay for an agreed action or use of space;
products represent servings or provisions that transfer into a character's inventory.
Both use one basket, the same native currency settlement and the same GM approval window.
There are no fake service Items and no additional compendium.

All twelve production services are record-only. Approval deducts payment, credits the merchant,
updates character memory and service statistics, and saves a private receipt. The GM narrates
fulfilment. No rest, healing, condition removal, calendar booking, room reservation, staff schedule,
feed consumption or wardrobe transfer occurs automatically. Optional execution hooks remain available
through the Services framework; none are attached to these definitions.

## Catalogue and pricing

Base prices favour copper for simple meals and feeding, silver for ordinary lodging and facilities,
and gold for private hospitality or premium accommodation. These are original project prices, not
mandatory 2014 lifestyle charges. Suggested ranges help the GM price local quality and scarcity;
they are advisory, not random rolls or caps. Merchant, character, negotiation and review modifiers
still apply, and may move a final price outside the recommended range.

| Service | Base price | Recommended range | Purchase unit | Suggested duration |
| --- | --- | --- | --- | --- |
| Rent Common Room | 2 sp | 1 sp–4 sp | one person for one night | One night; departure after breakfast |
| Rent Private Room | 6 sp | 4 sp–1 gp 5 sp | one room for up to two guests for one night | One night; departure after breakfast |
| Rent Luxury Room | 3 gp | 2 gp–8 gp | one room for up to two guests for one night | One night; departure after breakfast |
| Meal of the Day | 8 cp | 5 cp–2 sp | one served meal for one diner | About 30 minutes during kitchen hours |
| Breakfast | 5 cp | 3 cp–1 sp | one served breakfast for one diner | About 20 minutes in the morning |
| Dinner Package | 3 sp | 2 sp–6 sp | one two-course dinner for one diner | About one hour during evening kitchen hours |
| Stable Horse | 4 sp | 2 sp–8 sp | one stall for one horse for up to 24 hours | Up to 24 hours from arrival |
| Feed Horse | 8 cp | 5 cp–2 sp | one day of ordinary feed and feeding for one horse | Feed supplied over one day |
| Bath | 2 sp | 1 sp–5 sp | one bath for one person | About 30 minutes by arrangement |
| Laundry | 1 sp | 5 cp–3 sp | one ordinary outfit washed and dried | Usually next day; weather may delay drying |
| Private Dining Room | 2 gp | 1 gp–5 gp | one room for up to eight guests for one sitting | Up to three hours at an agreed time |
| Long-Term Lodging | 3 gp 5 sp | 2 gp 5 sp–7 gp | one private room for up to two guests for seven nights | Seven consecutive nights; dates agreed with the GM |

Service quantity multiplies the stated purchase unit. Two Private Room units mean two room-nights,
not two guests in a single room. Agree dates and occupants before approval. `maxQuantity` limits
one checkout; it does not track beds, stalls or available bookings. The GM confirms actual capacity.
Durations are descriptive and do not advance world time.

## Categories and inclusions

- **Accommodation:** shared sleeping space, private rooms, luxury rooms and seven-night lodging.
  Room prices exclude meals and animal care. Weekly lodging must not also incur nightly room fees
  for the same dates. Bedding belongs to the inn.
- **Food Services:** Meal of the Day, Breakfast and Dinner Package are dine-in meals. They create
  no inventory food and include only the food/water specified in their descriptions. Do not also
  charge for the same included portions as products. Drinks beyond included water are separate.
- **Stable:** Stable Horse includes shelter, bedding, water and ordinary care but **not feed**.
  Feed Horse supplies one day's ordinary feeding on site; it is distinct from packaged Horse Feed
  purchased as a carried Item. Staff does not insure animals or provide veterinary treatment.
- **Facilities:** Bath provides one filling and temporary use of washing materials. Laundry covers
  one ordinary outfit with next-day collection guidance, not armour, leather or repairs.
- **Hospitality:** Private Dining Room hires a room and routine table service for up to eight guests
  for one sitting. Food, drink and lodging remain separate.

Descriptions explicitly identify inclusions and exclusions. These distinctions prevent accidental
double charges while preserving the existing food/drink catalogue and its permanent IDs.

## Builder workflow

1. Update the module and restart Foundry. Rebuild the **Master Item Catalogue**, then rebuild Stock
   RollTables. Existing Tavern source data is now active: 296 unique total Items, including the
   unchanged 144 General Store records. The Tavern uses 152 authored menu Items plus 31 shared goods.
   There are still 32 stock tables; services are not RollTable stock.
2. Open Merchant Builder. Apply Roadside Tavern, Poor Hamlet Tavern, Town Inn or Luxury City Inn.
   Templates remain editable; catalogue logic is not hard-coded in the UI.
3. Review settlement, prosperity and economic profile, then **Save / Convert NPC**. Saving adds
   eligible defaults from the catalogue's `metadata.defaultServiceCategories` using the existing
   service availability rules. No inventory or currency is changed by this step.
4. Generate and confirm Stock to add food/drinks, and generate/apply Cash as needed. Existing
   inventory and cash remain subject to the usual preview and confirmation workflow.
5. In **Manage → Service Categories / Offerings**, inspect durations, units and recommended price
   ranges. Disable services the premises cannot provide, remove offers or set individual prices.
6. Players refresh the Shop and combine Inventory and Services in one basket. The GM confirms
   capacity, timing and inclusions before approval.

### Preset defaults

| Preset | Settlement / prosperity / profile | Initially available services |
| --- | --- | --- |
| Poor Hamlet Tavern | Hamlet / Poor / Modest | 4: common sleeping space, Meal of the Day, Breakfast, Feed Horse |
| Roadside Tavern | Village / Average / Standard | 9: common and private rooms, all three meals, both stable services, Bath and Laundry |
| Town Inn | Town / Prosperous / Standard | 11: Roadside services plus weekly lodging and Private Dining Room |
| Luxury City Inn | City / Luxury / Luxury | 11: private/luxury rooms, weekly lodging, all meals, stable services, facilities and private dining; no common sleeping room |

These are data-based defaults, not a universal claim that every inn has these facilities. All three
inputs matter: a wealthy modest tavern does not automatically become a luxury hotel. Urban luxury
rooms require Town/City/Large City, Wealthy/Luxury prosperity and a Luxury profile. Private dining
requires an urban settlement and Prosperous or better circumstances. See source availability arrays
for the complete policy.

Existing taverns receive defaults on their next explicit Builder Save, not silently at world load.
A per-catalogue record remembers which default identities have been considered. Repeated saves do
not restore services the GM removed, re-enable disabled offers or overwrite price overrides.
Upgrading settlement/prosperity/profile can add newly eligible defaults. Downgrading hides ineligible
offers but preserves their configuration; changing back can make them visible again. To deliberately
restore a removed default, offer it in Service Administration or regenerate its category.

Default seeding runs under the existing administration lock and is blocked by checkout/recovery.
Offers are saved before the processed-ID marker so a failed marker write can be retried without
duplicates. A partial failure is reported; reload the NPC before retrying. No existing history is reset.

## Content and compatibility

`data/services.json` contains five categories and twelve permanent `DT_SERVICE_TAV_*` identities.
Each includes a base price, `recommendedRange`, explicit `saleUnit`, descriptive `duration`, icon,
requirements note, tags, catalogue assignment and availability. New metadata is optional for older
third-party service definitions. Base prices must lie within their declared recommended ranges;
manual merchant overrides are not constrained to those ranges.

The existing 19 Tavern product files were moved from the deferred source list to the active source
list without changing their contents. The already-authored `DT_TABLE_TAV` profile now supplies its
food/drink assortment. Product names, source IDs and generated document IDs remain stable. Repeated
builds converge without duplicates. There is one shared Item compendium and no service compendium.
All artwork is reused from existing reviewed core references; no new art assets were created.

## Future expansion

Reservations, room capacity, date selection, stable occupants, special diets, laundry collection,
long-stay agreements and service-specific fulfilment could be added as explicit modules later.
Avoid hiding those systems in pricing descriptions or automatically consuming inventory now.
The current optional Macro, JournalEntry, RollTable and ActiveEffect hooks remain available for
campaign-specific behaviour under GM control. Their post-payment failure/non-replay rules remain
those in [Merchant Services](MERCHANT_SERVICES.md).

## Validation and live review

Automated tests cover production field completeness, known icon references, price ranges, four
preset selections, preserved manual edits/removals, prosperity upgrades and a mixed bread/ale/room
transaction. Existing tests cover transaction rollback, service failure handling and multiplayer
contention. The restored Item and RollTable builders are checked for identity preservation and
repeat-build convergence.

Live Foundry/Forge review is still required. Test an updated existing Tavern and a fresh NPC:
verify each preset's services, generate food/drink stock, purchase a drink plus a room and a bath,
reject a mixed basket, revise a service price with player consent, and confirm service purchases
never create Items. Confirm product icons and descriptions on the target installation. Test simultaneous
checkouts from separate player sessions. No live session was available during development.
