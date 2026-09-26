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
