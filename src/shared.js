// Mirrors hub-sdk.js exports used by logic.js — for unit tests only (no DOM/browser).

export function isAdult(member) {
  return member?.role === "adult";
}
