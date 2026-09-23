import { FLAG_SCOPE } from "../constants.js";

const DESCRIPTION_FIELDS = new Set(["system.description.value", "system.description.chat"]);

/**
 * Foundry sanitizes HTML on the server, after client-side model validation.
 * Accept only equivalent quote entities and break-tag serialization in descriptions.
 * Do not strip markup, decode escaped angle brackets, or loosen numeric/identity checks.
 */
function normalizedDescription(html) {
  return html
    .replace(/&(?:quot|apos|#0*(?:34|39)|#x0*(?:22|27));/giu, entity =>
      /^&(?:quot|#0*34|#x0*22);$/iu.test(entity) ? '"' : "'")
    .replace(/<br\s*\/?>/giu, "<br>");
}

function equivalentValue(actual, expected, path) {
  if (actual === expected) return true;
  return DESCRIPTION_FIELDS.has(path) && typeof actual === "string" && typeof expected === "string"
    && normalizedDescription(actual) === normalizedDescription(expected);
}

/** Compare only generated fields; extra saved fields still belong to Foundry/the GM. */
export function matchesGenerated(actual, expected, path = "") {
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length
      && expected.every((value, i) => matchesGenerated(actual[i], value, `${path}[${i}]`));
  }
  if (expected && typeof expected === "object") {
    return actual != null && Object.entries(expected).every(([key, value]) =>
      matchesGenerated(actual[key], value, path ? `${path}.${key}` : key));
  }
  return equivalentValue(actual, expected, path);
}

/** Bounded field diagnostics use the same equivalence rules as preview/reconciliation. */
export function generatedDifferences(actual, expected, { limit = 20 } = {}) {
  const differences = [];
  function visit(saved, wanted, path) {
    if (differences.length >= limit) return;
    if (Array.isArray(wanted)) {
      if (!Array.isArray(saved) || saved.length !== wanted.length) differences.push({ path, expected: wanted, actual: saved });
      else wanted.forEach((value, i) => visit(saved[i], value, `${path}[${i}]`));
    } else if (wanted && typeof wanted === "object") {
      for (const [key, value] of Object.entries(wanted)) visit(saved?.[key], value, path ? `${path}.${key}` : key);
    } else if (!equivalentValue(saved, wanted, path)) differences.push({ path, expected: wanted, actual: saved });
  }
  visit(actual, expected, "");
  return differences;
}

function displayValue(value) {
  if (value === undefined) return "<missing>";
  const text = JSON.stringify(value);
  return text.length > 180 ? `${text.slice(0, 180)}…` : text;
}

/** Failed writes remain failures. Tell the GM which source ID/field needs investigation. */
export function readBackError(failedDocuments, actual) {
  const byId = new Map(actual.map(item => [item._id, item]));
  const error = new Error(`Read-back verification failed for ${failedDocuments.length} item(s); generated fields differ from the source. See the item/field details below.`);
  error.details = [];
  for (const expected of failedDocuments) {
    if (error.details.length >= 20) break;
    const sourceId = expected.flags[FLAG_SCOPE].sourceId;
    const saved = byId.get(expected._id);
    if (!saved) {
      error.details.push({ path: sourceId, message: `${expected.name}: item is missing from the saved compendium.` });
      continue;
    }
    for (const difference of generatedDifferences(saved, expected, { limit: 20 - error.details.length })) {
      error.details.push({
        path: `${sourceId}.${difference.path}`,
        message: `${expected.name}: expected ${displayValue(difference.expected)}; saved ${displayValue(difference.actual)}.`
      });
    }
  }
  if (error.details.length === 20) error.details.push({ path: "verification", message: "Showing the first 20 field mismatches; additional details may be omitted." });
  return error;
}
