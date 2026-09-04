"use client";

import { useSyncExternalStore } from "react";
import { qpetHiddenSnapshot, qpetServerSnapshot, setQpetHidden, subscribeQpetHidden } from "@/lib/quantum/qpetVisibility";

/** Footer control: hide or bring back the resident. Persists per browser. */
export function PetToggle() {
  const hidden = useSyncExternalStore(subscribeQpetHidden, qpetHiddenSnapshot, qpetServerSnapshot);
  return (
    <button
      type="button"
      onClick={() => setQpetHidden(!hidden)}
      className="hover:text-accent"
    >
      {hidden ? "show QPet" : "hide QPet"}
    </button>
  );
}
