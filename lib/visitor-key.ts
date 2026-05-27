const visitorStorageKey = "prompt-lab-visitor-key";

export function getPromptLabVisitorKey() {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(visitorStorageKey);
  if (existing) return existing;

  const nextKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(visitorStorageKey, nextKey);
  return nextKey;
}
