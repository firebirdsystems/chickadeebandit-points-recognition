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
 * Whether the given member can award points (adults only).
 */
export function canAwardPoints(me) {
  return me?.role === "adult";
}
