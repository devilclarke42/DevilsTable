# Tavern Guide

**Audience:** GMs running inns/taverns and menu authors. **Purpose:** explain portions, presets and hospitality.

Devil’s Table provides **205 Tavern products and 16 services**. The menu combines 168 Tavern-authored products with 37 existing supplies. All products use one generated master Item compendium. Services remain separate definitions and never become fake inventory Items.

## Build your first inn

1. Rebuild the master Item catalogue and Merchant Stock RollTables from Devil’s Table settings. These actions read the canonical JSON and preview changes before writing.
2. Open Merchant Builder, select a standard NPC and apply a Tavern preset in **Setup**. Read its pricing, settlement, prosperity, stock profile and private notes before saving.
3. In **Identity**, set an optional business name and public description. The Actor still owns its name, portrait, biography and token. A suggested story does not rename an Actor or establish campaign facts.
4. In **Stock**, generate a preview. Review the actual dishes, quantities and value, regenerate if needed, then apply. Existing goods are preserved. Use Empty Stock only when deliberately replacing a menu.
5. In **Services**, review the generated offerings. Adjust prices, turn offers off, mark temporary unavailability and configure actual rooms if using integrations. Save Service Offerings.
6. Review the starting cash in **Cash** and apply it separately if necessary. Existing funds are preserved unless you explicitly choose replacement.
7. Set the merchant Open. Players select their own nearby character token and use the merchant interaction to browse the Shop UI. The Merchant Actor remains GM-only.

Generation supplies an assortment, not every dish in the catalogue. Preset changes alter future generation settings; they do not empty inventory or erase manually edited service offers. After changing an existing merchant’s profile, inspect both Stock and Services before reopening it.

## Products and purchase units

| Menu area | Categories | What the purchase represents |
| --- | --- | --- |
| Drinks | Ale, Beer, Mead, Wine, Spirits, Imported Drinks, Non-alcoholic Drinks, Hot Drinks | A specified poured serving; the inn retains the vessel |
| Meals | Breakfast, Lunch, Dinner, Soups, Stews, Roasts, Fish, Luxury Meals | One described plate, bowl or portion; unlisted sides and drinks are separate |
| Smaller food | Bread, Cheese, Desserts, Snacks | A named loaf, portion, slice or packet |
| On the road | Travel Meals, shared Camping supplies | A packed meal or explicitly stated equipment unit |
| Animal provisions | Animal Feed, shared Animal Supplies | Measured feed or an explicitly stated ration; physical feed retains its weight |
| Taproom supplies | Tavern Supplies | Tobacco, an empty clay pipe, playing cards and bone dice |
| Shared equipment | Containers, Lighting & Fire, Household, Rope & Climbing, Travel | Existing canonical equipment; never separate Tavern copies |

The menu includes Onion Broth, Creamed Mushroom Soup, Chicken Noodle Broth, Sorrel Spring Soup, Grilled Sardines, Mussels in Cider, Baked Haddock, Pickled Herring, Southern Date Wine, Island Palm Spirit, Resined White Wine and Spiced Pomegranate Drink. These complement existing dishes rather than replace them. Fish Chowder remains a stew; Pan-Fried Trout Supper remains a full Dinner plate.

Travel Rations, Waterskin, Firewood, Bedroll, Mess Kit and Flint & Steel gain Tavern membership under their existing permanent IDs. A waterskin is sold empty. Trail food does not include water. Pipe Tobacco is an ounce packet; its consumption is manual. Cards and dice are ordinary goods with GM-adjudicated gaming proficiency, not automated gambling.

Copper prices cover ordinary drinks and snacks, silver covers fuller meals and useful supplies, and gold is reserved for fine hospitality. Weights refer to one complete sale unit. Serving ware is excluded from poured drinks and plated food because it stays with the inn. Carry-away purchases require suitable containers; the module does not create free glasses or duplicate their contents. Native food consumption records one complete unit with no healing, intoxication or rest bonus.

## Presets and personality

Every preset is editable. These estimates are rounded expected distinct product counts for a fresh merchant, before rolling and before excluding existing stock. They are not guaranteed quantities. Service counts reflect the preset’s current eligibility rules.

| Preset | Settlement / prosperity | Pricing | Expected stock | Services |
| --- | --- | ---: | ---: | ---: |
| Roadside Tavern | Village / Average | +0% | 21 | 12 |
| Poor Hamlet Tavern | Hamlet / Poor | -5% | 14 | 5 |
| Town Inn | Town / Prosperous | +5% | 38 | 15 |
| Luxury Inn | City / Luxury | +25% | 54 | 15 |
| Village Inn | Village / Average | -5% | 23 | 9 |
| Dockside Tavern | Town / Prosperous | +10% | 40 | 13 |
| Coaching Inn | Town / Average | +5% | 39 | 13 |
| Roadhouse | Hamlet / Poor | -10% | 14 | 5 |
| Noble Inn | Large-City / Wealthy | +20% | 54 | 13 |

The six stock profiles are the broad Village Tavern profile plus Roadside, Dockside, Luxury, Coaching and Roadhouse. They share Item references and existing quantity rules. Each profile uses four tables, for **24 Tavern tables**. Categories filter those pools; no category-specific table set is created. All older table identities remain reserved.

Roadside menus emphasise packed food, simple hot meals and travel replacements. Dockside menus guarantee fish specialities and include imported drinks. Luxury menus favour wines, fine cooking and premium pours over common-room staples. Coaching menus emphasise breakfasts, provisions and animal feed. Roadhouses use a smaller inexpensive menu with ordinary ale and filling food.

Specialist businesses such as Dockside and Noble presets do not default to horse stabling or weekly lodging. Those services use standard or luxury business profiles; change the editable profile if the particular business provides them. Coaching Inn uses Average prosperity to keep its service mix practical. The Services tab shows the resulting eligibility before the GM accepts a purchase.

## Merchant Stories

Setup notes contain **Personality**, **Suggested greeting**, **Specialities**, **Known For** and **Optional Stories**. They are private GM text, generated when a preset is applied and editable in the existing notes field. They create no quests, scene occupants, relationship changes, bookings or world events.

For example, a friendly Village Inn mentions a delayed flour delivery and a regular’s forgotten coat. A Dockside Tavern may have a parcel waiting for a ship. A Luxury Inn may have a guest who orders dinner for an empty chair. These are optional prompts: remove them or adapt them before establishing anything in your campaign.

To present “Merrick’s Rest”, enter that business name in Identity and keep the NPC’s actual Actor/token name. Share only the chosen public details through Public Description or Shop Description. Private rumours and GM notes are never sent in player browse packets. Greetings are suggested dialogue for the GM, not automatic chat messages.

## Services

| Service | Base price | Recommended range | Sale unit | Duration |
| --- | --- | --- | --- | --- |
| Rent Common Room | 2 sp | 1 sp–4 sp | one person for one night | 1 night(s); checkout at merchant time (default 10:00), GM may override |
| Rent Private Room | 6 sp | 4 sp–15 sp | one room for up to two guests for one night | 1 night(s); checkout at merchant time (default 10:00), GM may override |
| Rent Luxury Room | 3 gp | 2 gp–8 gp | one room for up to two guests for one night | 1 night(s); checkout at merchant time (default 10:00), GM may override |
| Meal of the Day | 8 cp | 5 cp–2 sp | one served meal for one diner | About 30 minutes during kitchen hours |
| Breakfast | 5 cp | 3 cp–1 sp | one served breakfast for one diner | About 20 minutes in the morning |
| Dinner Package | 3 sp | 2 sp–6 sp | one two-course dinner for one diner | About one hour during evening kitchen hours |
| Stable Horse | 4 sp | 2 sp–8 sp | one stall for one horse for up to 24 hours | Up to 24 hours from arrival |
| Feed Horse | 8 cp | 5 cp–2 sp | one day of ordinary feed and feeding for one horse | Feed supplied over one day |
| Bath | 2 sp | 1 sp–5 sp | one bath for one person | About 30 minutes by arrangement |
| Laundry | 1 sp | 5 cp–3 sp | one ordinary outfit washed and dried | Usually next day; weather may delay drying |
| Private Dining Room | 2 gp | 1 gp–5 gp | one room for up to eight guests for one sitting | Up to three hours at an agreed time |
| Long-Term Lodging | 35 sp | 25 sp–7 gp | one private room for up to two guests for seven nights | 7 night(s); checkout at merchant time (default 10:00), GM may override |
| Meeting Room Hire | 8 sp | 5 sp–2 gp | one room for up to eight people for two hours | Two hours at an agreed time |
| Secure Storage | 3 sp | 1 sp–1 gp | one parcel up to 20 lb in the inn’s locked store for one day | Up to 24 hours; collection arranged with the keeper |
| Courier Message | 2 sp | 1 sp–8 sp | one written message to one address within the settlement | One local delivery attempt during working hours |
| Package Holding | 5 cp | 2 cp–2 sp | one labelled parcel up to 10 lb held behind the counter for one day | Until collection within 24 hours |

## Inclusions and exclusions

Accommodation includes the stated sleeping space and bedding, not food or animal care. A weekly booking replaces seven nightly charges for the same room and dates. Common Room covers one guest; private and luxury rooms cover up to two guests unless the GM changes the agreement. Checkout defaults to 10:00 and remains configurable per merchant and per purchase.

Meal of the Day, Breakfast and Dinner Package are flexible dine-in service options. Their descriptions state included portions. They create no food Items and must not be charged alongside the same included menu portions. Dinner Package is the evening meal package; no duplicate Evening Meal definition is needed.

Stable Horse includes shelter, bedding, water and ordinary care, but not feed. Feed Horse covers ordinary feeding on site, unlike carried Horse Feed. Baths provide temporary use of washing materials; laundry covers an ordinary outfit, not armour, leatherwork or repairs. Private Dining Room and Meeting Room Hire do not include an unlisted banquet.

Secure Storage covers one parcel up to 20 lb in a locked store for a day. Package Holding covers one parcel up to 10 lb behind the counter for a day without a locked-store promise. Neither provides insurance or automatic inventory transfer. Courier Message covers one local written message and one delivery attempt; dangerous routes, replies and travel outside the settlement require a separate agreement. No real message is sent by purchasing it.

- **Accommodation:** common room, private room, luxury room and seven-night lodging.
- **Facilities and stable:** bath, laundry, stabling and feeding.
- **Food:** Meal of the Day, Breakfast and Dinner Package cover flexible on-site meal service. Buy a specific menu product when the exact dish should become an inventory Item. Never charge twice for an included portion.
- **Hospitality:** Private Dining Room and Meeting Room Hire charge for agreed use of space. Food and drink are separate unless explicitly included.
- **Premium:** Secure Storage, Courier Message and Package Holding record an agreed service. They do not silently move possessions, send messages or insure valuables.

A player can purchase ale, a packed meal, a room and a bath in one basket. The GM sees products and services separately, reviews the same total, and approves one native currency settlement. Services update usage counts, revenue, last purchase and transaction history. The GM narrates fulfilment unless a configured optional action performs part of it.

## Rooms and optional integrations

Room checkout defaults to **10:00**. Set a merchant default in Setup; override it for one purchase in GM Review. Recalculate sends changed terms back to the player before approval. One night ends on the following calendar date at that clock time. Weekly lodging covers seven nights. An explicitly configured room duration takes precedence over the definition’s suggested duration. Old bookings retain their saved endpoints.

In Services, expand a room’s configuration and enter its actual name and, for keys, its door Wall UUIDs. Newly configured rooms preselect compatible enabled integrations when available. Explicit existing opt-outs are preserved. Saving with a key action requires at least one configured door; the module does not guess which door belongs to the room.

| Integration | Approved rental behaviour | Without the integration |
| --- | --- | --- |
| Lock & Key | Creates the configured named key on the purchasing character and grants access to the selected doors | Key action is skipped; payment and service receipt still complete |
| Calendaria | Creates private check-in/stay and checkout notes using the saved booking endpoint | Scheduling action is skipped; ordinary rental continues |
| Native world-time expiry | The active GM processes Expire on Checkout keys at the recorded endpoint | Calendaria is not required for native expiry |

A configured rental creates one booking/key per purchased service line. Quantity does not select extra physical rooms or extend the stay. The GM must confirm occupants, room capacity and dates. Use one configured room per approved rental when issuing a physical key. No occupancy calendar, reservation conflict detection or automatic extra-night billing is provided.

Persistent keys remain valid after checkout. Manual Recovery keys wait for explicit GM action. **Manage Integrations / Room Bookings** provides manual checkout and recovery. Failed optional actions are recorded for attention; do not purchase the service again to retry. See [Integrations](INTEGRATIONS.md) for the full recovery workflow.

## Shop UI and accessibility

The Shop uses catalogue-defined category names and icons. Empty inventory categories remain hidden. Category buttons form a horizontally scrollable row and can be reached by keyboard. Inventory and Services share search and a persistent basket. Search covers full descriptions, names, tags and categories, including text hidden behind an expansion.

Long descriptions show a short preview with a keyboard-operable Full Description disclosure. The original text remains available. Images load lazily; filtering changes visibility without rerendering the whole window or discarding the basket. Narrow windows stack inventory and basket in separate scrollable areas. Focus outlines and descriptive Add button labels support keyboard and screen-reader use.

This release has automated DOM/context checks, not a live browser accessibility certification. Test a narrow window, keyboard navigation, light/dark themes and your Forge installation before using the Tavern as a public showcase. Screenshots should be captured from that verified installation; this guide does not present mockups as live Foundry screenshots.

## Best practices

- Review the generated menu as a business: keep a dependable breakfast, inexpensive drink, filling supper and suitable non-alcoholic option.
- Check portions and shared supplies before changing prices. An empty waterskin and a glass of water are different purchase units.
- Set realistic stock quantities for prepared meals; a catalogue entry is a recipe option, not proof every kitchen can cook it today.
- Explain service exclusions before approval, particularly feed, included meals, storage custody and courier distance.
- Daily restock is currently a stored preference. Regenerate Stock manually; generation preserves existing inventory rather than simulating spoilage or kitchen production.
- Keep merchant history and notes private. Use the existing public description fields for information guests should know.
- For room integrations, make a test booking with a player, inspect the issued key, advance world time past checkout and confirm only that rental’s access expires.

## Upgrade and acceptance

Rebuild the affected Item catalogue and Stock RollTables, then repeat builds to confirm unchanged identities. Actor inventory is not rewritten. Test a mixed food/service checkout and actual room actions in the supported world; use [Testing](TESTING.md) for the acceptance matrix.
