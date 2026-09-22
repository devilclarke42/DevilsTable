/**
 * Frozen v1 mapping: FNV-1a 64-bit over the ASCII permanent ID, padded to 16 hex digits.
 * This is an identity mapping, not a security hash. Validation rejects collisions.
 * Never change this algorithm after publication without an explicit migration.
 */
export function documentIdFor(sourceId) {
  let hash = 0xcbf29ce484222325n;
  for (const byte of new TextEncoder().encode(sourceId)) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}
