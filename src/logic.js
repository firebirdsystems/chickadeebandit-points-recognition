// Pure business logic — no DOM, no fetch.

/**
 * Build a ranked leaderboard from raw award rows.
 * awards: Array<{ member_id, category_id, points }>
 * members: Array<{ id, name, ... }>
 * categoryId: optional string — filter to one category
 * Returns sorted Array<{ member, points }> descending, alpha on ties.
 */
export function buildLeaderboard(awards, members, categoryId = null) {
  const filtered = categoryId ? awards.filter(a => a.category_id === categoryId) : awards;
  const totals = new Map();
  for (const award of filtered) {
    totals.set(award.member_id, (totals.get(award.member_id) ?? 0) + award.points);
  }
  return members
    .filter(m => totals.has(m.id))
    .map(m => ({ member: m, points: totals.get(m.id) }))
    .sort((a, b) => b.points - a.points || a.member.name.localeCompare(b.member.name));
}

/**
 * Sum all points for one member from an awards array.
 */
export function memberTotal(memberId, awards) {
  return awards.filter(a => a.member_id === memberId).reduce((s, a) => s + a.points, 0);
}

/**
 * Rank label for a zero-based index: medals for top 3, numbers after.
 */
export function rankLabel(index) {
  return ["🥇", "🥈", "🥉"][index] ?? String(index + 1);
}

/**
 * Whether `me` may award points and manage categories/periods. Mirrors the
 * server-side `write_privileged_only` policy on pr_awards / pr_categories /
 * pr_periods, gated by the configured officers group (officers_group_id).
 *
 * MUST match the hub's privileged resolution exactly: privileged IFF the
 * officers group is configured, still exists, and the member is in it. There is
 * NO "all adults" fallback — the previous `me.role === "adult"` check diverged
 * from the server (which gates on group membership, not role), so an adult not in
 * the officers group, or any adult when no group is configured, would see award
 * controls that silently 403. See __tests__/helpers/privileged-gate.mjs.
 *
 * @param {object|null} me
 * @param {Array}  groups
 * @param {string|null} officersGroupId
 */
export function canAwardPoints(me, groups, officersGroupId) {
  if (!me || !officersGroupId) return false;
  const g = (groups ?? []).find(g => g.id === officersGroupId);
  return !!g && g.memberIds.includes(me.id);
}

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * The note is why someone was recognised — the whole point of the
 * award — so it is searchable alongside the category it was filed under.
 */
export function searchableFields(item) {
  return [item.note, item.category_name, item.period_name];
}

/**
 * "Retry after a lost response" (app-template guide): whether a failed
 * write's answer leaves its outcome unknown — no status, a 400, or a 5xx
 * other than 507 — so the page reads the row back by its pinned id. A
 * `UNIQUE_CONSTRAINT` answer is a 400 too: the usual retry of a create that
 * landed collides on its own pinned id. Only finding the row under that id
 * says it landed; not found keeps the usual failure line.
 */
export function outcomeUnknown(e) {
  if (e?.code === "UNIQUE_CONSTRAINT" || /UNIQUE constraint failed/i.test(String(e?.message ?? ""))) return true;
  const status = Number(e?.status) || 0;
  return status === 0 || status === 400 || (status >= 500 && status !== 507);
}

/**
 * Whether a stored row differs from what the form holds now, over the form's
 * own fields only, compared as text with a missing value as empty.
 */
export function storedDiffers(row, fields) {
  return Object.keys(fields).some((k) => String(row?.[k] ?? "") !== String(fields[k] ?? ""));
}

export const SAVED_AS_FIRST = "Saved as first entered — check it and update what changed.";

/**
 * The line a failed write shows ("Refused, gone, or failed" in the app-template
 * guide): "try again" only when retrying can work. `action` and `thing` are the
 * app's own words. `found` is the caller's re-read after a write that changed
 * nothing: false = the row is gone, true = it is still there, null = the
 * re-read failed. A row still there after a plain `WHERE id = ?` write means
 * the row policy refused it; only a `guarded` write (one with a state
 * condition) can have been "changed by someone else". Decided from the error's
 * `status` / `code`, never from the hub's or the browser's text.
 */
export function failureLine(e, { action, thing, found, guarded = false } = {}) {
  if (e?.forUser) return e.message;
  if (e?.code === "UNIQUE_CONSTRAINT" || /UNIQUE constraint failed/i.test(String(e?.message ?? ""))) return `That ${thing} already exists.`;
  if (e?.status === 403 || (found === true && !guarded)) return `You don’t have permission to ${action}.`;
  if (e?.status === 507) return "The household’s storage is full — free up space first.";
  if (e?.status === 429) return "Too many tries — wait a minute and try again.";
  if (found === null) return `Couldn’t ${action} — try again.`;
  if (found === false || (found === undefined && e?.status === 404)) return `This ${thing} has been removed.`;
  if (found === true || e?.status === 409) return `This ${thing} was changed by someone else — check it first.`;
  return `Couldn’t ${action} — try again.`;
}
