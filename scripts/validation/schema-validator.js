/**
 * Compile the deliberately small JSON Schema vocabulary used by this project.
 * Not a general JSON Schema implementation: unsupported keywords fail closed.
 * The same schema and validator run in Node and Foundry; there is no runtime CDN.
 */
const KEYWORDS = new Set([
  "$schema", "title", "description", "type", "properties", "required", "additionalProperties",
  "items", "uniqueItems", "minItems", "minLength", "maxLength", "pattern", "enum", "const", "minimum"
]);
const TYPES = {
  object: value => value !== null && typeof value === "object" && !Array.isArray(value),
  array: Array.isArray,
  string: value => typeof value === "string",
  number: Number.isFinite,
  integer: Number.isSafeInteger
};

function equal(a, b) {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && equal(a[key], b[key]));
}

export function compileSchema(schema) {
  if (!Object.hasOwn(TYPES, schema?.type)) throw new Error(`Unsupported schema type: ${schema?.type}`);
  for (const key of Object.keys(schema)) {
    if (!KEYWORDS.has(key)) throw new Error(`Unsupported schema keyword: ${key}`);
  }
  const properties = Object.fromEntries(Object.entries(schema.properties ?? {}).map(([key, child]) => [key, compileSchema(child)]));
  const items = schema.items ? compileSchema(schema.items) : null;
  const pattern = schema.pattern ? new RegExp(schema.pattern, "u") : null;

  return (value, path = "$", errors = []) => {
    const add = message => errors.push({ path, message });
    if (!TYPES[schema.type](value)) {
      add(`Expected ${schema.type}.`);
      return errors;
    }
    if (Object.hasOwn(schema, "const") && !equal(value, schema.const)) add(`Expected ${JSON.stringify(schema.const)}.`);
    if (schema.enum && !schema.enum.some(candidate => equal(value, candidate))) add(`Expected one of: ${schema.enum.join(", ")}.`);
    if (typeof value === "string") {
      const length = [...value].length;
      if (length < (schema.minLength ?? 0)) add(`Must have at least ${schema.minLength} characters.`);
      if (length > (schema.maxLength ?? Infinity)) add(`Must have at most ${schema.maxLength} characters.`);
      if (pattern && !pattern.test(value)) add("Does not match the required format.");
    }
    if (typeof value === "number" && value < (schema.minimum ?? -Infinity)) add(`Must be at least ${schema.minimum}.`);
    if (Array.isArray(value)) {
      if (value.length < (schema.minItems ?? 0)) add(`Requires at least ${schema.minItems} entries.`);
      if (schema.uniqueItems && value.some((entry, i) => value.slice(0, i).some(other => equal(entry, other)))) add("Duplicate array entries are not allowed.");
      if (items) value.forEach((entry, i) => items(entry, `${path}[${i}]`, errors));
    } else if (schema.type === "object") {
      for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) errors.push({ path: `${path}.${key}`, message: "Required field is missing." });
      for (const [key, entry] of Object.entries(value)) {
        if (Object.hasOwn(properties, key)) properties[key](entry, `${path}.${key}`, errors);
        else if (schema.additionalProperties === false) errors.push({ path: `${path}.${key}`, message: "Unknown field." });
      }
    }
    return errors;
  };
}
