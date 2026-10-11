const STORAGE_KEY = "vmrs:printer-agent-token";
const listeners = new Set<() => void>();

/**
 * The printer agent's pairing token is entered by the operator and kept in
 * this browser only. It is never part of the bundle or sent to the VMRS API.
 */
export const getPrinterAgentToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setPrinterAgentToken = (token: string | null) => {
  try {
    if (token) window.localStorage.setItem(STORAGE_KEY, token);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: the token just has to be entered again.
  }
  listeners.forEach((listener) => listener());
};

export const subscribePrinterAgentToken = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};
