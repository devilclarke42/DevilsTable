let busy = false;

/** Table builds and legacy cleanup share one client guard; use one active-GM tab. */
export function withStockOperation(operation) {
  return async function (...args) {
    if (busy) throw new Error("A Devil's Table stock operation is already running in this client.");
    busy = true;
    try { return await operation(...args); }
    finally { busy = false; }
  };
}
