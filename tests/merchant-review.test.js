import test from "node:test";
import assert from "node:assert/strict";

test("review prevents repeated decisions, stays open after failed receipt, then retries", async () => {
  globalThis.foundry = { applications: { api: { ApplicationV2: class {
    async close() { this.closed = true; }
  }, HandlebarsApplicationMixin: Base => Base } } };
  const { MerchantReviewApplication } = await import("../scripts/merchant/review-app.js");
  let fail = true, calls = 0;
  const app = new MerchantReviewApplication({ onFinish: async decision => {
    calls++; assert.equal(decision, "rejected");
    await new Promise(resolve => setImmediate(resolve));
    return !fail;
  } });
  const reject = MerchantReviewApplication.DEFAULT_OPTIONS.actions.reject;
  await Promise.all([reject.call(app), reject.call(app)]);
  assert.equal(calls, 1); assert.equal(app.closed, undefined);
  fail = false; await reject.call(app);
  assert.equal(calls, 2); assert.equal(app.closed, true);
});

test("review template parses quantity and price inside each correctly attributed trade row", async () => {
  const { execFileSync } = await import("node:child_process");
  // Parse the real template row as HTML, not the permissive DOM doubles used by service tests.
  execFileSync("python3", ["-c", `
from html.parser import HTMLParser
from pathlib import Path
text = Path('templates/merchant-review.hbs').read_text()
row = text.split('{{#each basket}}')[1].split('{{/each}}')[0]
for key, value in {'id':'rope','direction':'buy','name':'Rope','priceLabel':'1 sp','quantity':'1','copper':'10'}.items():
    row = row.replace('{{' + key + '}}', value)
class ReviewParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.inside=False; self.fields={}; self.direction=None
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag=='div' and 'data-trade-line' in attrs:
            self.inside=True; self.direction=attrs.get('data-direction')
        if self.inside and tag=='input': self.fields[attrs.get('name')]=attrs.get('value')
    def handle_endtag(self, tag):
        if tag=='div': self.inside=False
parser=ReviewParser(); parser.feed(row)
assert parser.direction=='buy', parser.direction
assert parser.fields=={'quantity':'1','copper':'10'}, parser.fields
`], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
});

test("malformed review fields report an error without approving or throwing", async () => {
  const { MerchantReviewApplication } = await import("../scripts/merchant/review-app.js");
  const errors = []; let decisions = 0;
  globalThis.ui = { notifications: { error: message => errors.push(message) } };
  const app = new MerchantReviewApplication({ proposal: { basket: [{ id: "rope", direction: "buy", quantity: 1, copper: 10 }] },
    onFinish: async () => { decisions++; } });
  app.element = { querySelectorAll: () => [{ dataset: { id: "rope", direction: "buy" }, querySelector: () => null }] };
  await MerchantReviewApplication.DEFAULT_OPTIONS.actions.approve.call(app);
  assert.equal(decisions, 0); assert.match(errors[0], /missing a quantity or price/);
});
