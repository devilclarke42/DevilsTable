# Tavern Services

Sprint 11 — Tavern Completion · 0.3.0-alpha.13 · 3 October 2026

## Service philosophy

The sixteen Tavern services sell hospitality, staff time and agreed use of space. They are data definitions, not Items. Products and services use one basket, one GM review and one native currency settlement. GM approval records payment, merchant memory, private history and service usage. The GM confirms capacity and narrates fulfilment except where an optional configured action supplies part of it.

Copper supports simple meals and short-term parcel holding; silver supports ordinary facilities and lodging; gold supports private hospitality and luxury accommodation. Recommended ranges are editorial guidance, not limits on GM pricing. All services use the existing shop, character, negotiation and review modifiers.

## Complete catalogue

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

## Builder and availability

Saving a Tavern configuration seeds eligible services once per service identity. It preserves explicit removals, disabled offers and price overrides. Newly eligible definitions can be added after a merchant upgrade. Services can be searched, grouped, enabled, disabled, repriced and marked temporarily unavailable in the top-level Services tab.

Settlement, prosperity and business profile determine eligibility. Poor hamlets offer basic hospitality; prosperous settlements can offer private dining and secure storage; wealthy luxury profiles can offer luxury rooms. Specialist profiles do not include Stable Horse or Long-Term Lodging by default. Use a standard/luxury business profile for a specialist inn that also needs those offerings. Inspect Services after changing profiles; existing saved offers are preserved but ineligible services are not sold.

The six curated Tavern stock profiles shape product generation independently of service definitions. The [Tavern Guide](TAVERN_GUIDE.md) lists preset service counts and explains each business style. Presets include private editable stories and suggested greetings, without campaign events or relationship changes.

## Optional integrations

Room definitions declare accommodation and a suggested number of nights. Configured merchant-local rooms supply names, door references, duration and expiry policy. New room forms preselect compatible enabled Lock & Key and Calendaria integrations; the GM must supply actual room mappings and save. Existing explicit opt-outs remain respected.

Approval creates the named key on the purchasing character when configured Lock & Key is available, and private check-in/checkout notes when configured Calendaria is available. Both use the same persisted booking endpoint. Missing, disabled or incompatible modules skip optional actions while the service purchase completes. Non-room services remain record-only unless the GM authors optional actions through the framework.

One configured room booking/key is created per purchased service line. Quantity does not reserve more rooms or multiply the duration. The GM confirms real capacity. Expire on Checkout uses native world time and an active GM; Persistent and Manual Recovery policies remain separate. Old bookings retain their endpoints. See [Integrations](INTEGRATIONS.md) for setup and recovery.

## Future expansion and validation

Future room capacity, reservation conflict handling, automatic kitchen stock consumption, courier routes and insured custody require separately reviewed work. This catalogue makes no promise that those systems exist.

Automated checks cover all service fields, ranges, icon references, eligibility, preservation of manual offers, statistics, mixed baskets and optional integration behaviour. Live Foundry and Forge acceptance remains necessary. No automated test is presented as a live screenshot or a substitute for checking installed external modules.
