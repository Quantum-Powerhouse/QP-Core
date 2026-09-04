/** Persistent QPet visibility. One localStorage flag, observable, safe when
 *  storage is unavailable. The footer toggles it; the pet subscribes. */
const KEY = "qpet-hidden";
const EVENT = "qpet-visibility";

export function qpetHiddenSnapshot(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function qpetServerSnapshot(): boolean {
  return false;
}

export function subscribeQpetHidden(onChange: () => void): () => void {
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function setQpetHidden(hidden: boolean): void {
  try {
    if (hidden) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}
