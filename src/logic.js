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
