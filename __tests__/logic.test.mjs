import { describe, it, expect } from "vitest";
import { buildLeaderboard, memberTotal, rankLabel, canAwardPoints } from "../src/logic.js";

const MEMBERS = [
  { id: "m1", name: "Alice", role: "adult" },
  { id: "m2", name: "Bob",   role: "adult" },
  { id: "m3", name: "Carol", role: "adult" },
];

// ── buildLeaderboard ──────────────────────────────────────────────────────────

describe("buildLeaderboard", () => {
  it("ranks members by total points descending", () => {
    const awards = [
      { member_id: "m1", category_id: "c1", points: 40 },
      { member_id: "m2", category_id: "c1", points: 10 },
      { member_id: "m3", category_id: "c1", points: 25 },
    ];
    const result = buildLeaderboard(awards, MEMBERS);
    expect(result.map(r => r.member.id)).toEqual(["m1", "m3", "m2"]);
    expect(result.map(r => r.points)).toEqual([40, 25, 10]);
  });

  it("aggregates multiple awards for the same member", () => {
    const awards = [
      { member_id: "m1", category_id: "c1", points: 10 },
      { member_id: "m1", category_id: "c2", points: 15 },
      { member_id: "m2", category_id: "c1", points: 30 },
    ];
    const result = buildLeaderboard(awards, MEMBERS);
    expect(result[0].member.id).toBe("m2");
    expect(result[1].points).toBe(25);
  });

  it("breaks ties alphabetically by name", () => {
    const awards = [
      { member_id: "m1", category_id: "c1", points: 20 },
      { member_id: "m2", category_id: "c1", points: 20 },
    ];
    const result = buildLeaderboard(awards, MEMBERS);
    expect(result[0].member.id).toBe("m1"); // Alice before Bob
    expect(result[1].member.id).toBe("m2");
  });

  it("excludes members with no awards", () => {
    const awards = [{ member_id: "m1", category_id: "c1", points: 10 }];
    const result = buildLeaderboard(awards, MEMBERS);
    expect(result).toHaveLength(1);
    expect(result[0].member.id).toBe("m1");
  });

  it("filters by categoryId when provided", () => {
    const awards = [
      { member_id: "m1", category_id: "c1", points: 100 },
      { member_id: "m2", category_id: "c2", points: 5 },
    ];
    const result = buildLeaderboard(awards, MEMBERS, "c2");
    expect(result).toHaveLength(1);
    expect(result[0].member.id).toBe("m2");
    expect(result[0].points).toBe(5);
  });

  it("returns empty array when no awards match", () => {
    expect(buildLeaderboard([], MEMBERS)).toEqual([]);
    expect(buildLeaderboard([], MEMBERS, "c99")).toEqual([]);
  });

  it("null categoryId includes all categories", () => {
    const awards = [
      { member_id: "m1", category_id: "c1", points: 5 },
      { member_id: "m1", category_id: "c2", points: 5 },
    ];
    const result = buildLeaderboard(awards, MEMBERS, null);
    expect(result[0].points).toBe(10);
  });
});

// ── memberTotal ───────────────────────────────────────────────────────────────

describe("memberTotal", () => {
  it("sums points for the given member", () => {
    const awards = [
      { member_id: "m1", points: 10 },
      { member_id: "m1", points: 15 },
      { member_id: "m2", points: 20 },
    ];
    expect(memberTotal("m1", awards)).toBe(25);
    expect(memberTotal("m2", awards)).toBe(20);
  });

  it("returns 0 for a member with no awards", () => {
    expect(memberTotal("m99", [])).toBe(0);
    expect(memberTotal("m99", [{ member_id: "m1", points: 10 }])).toBe(0);
  });
});

// ── rankLabel ─────────────────────────────────────────────────────────────────

describe("rankLabel", () => {
  it("returns medals for the top three", () => {
    expect(rankLabel(0)).toBe("🥇");
    expect(rankLabel(1)).toBe("🥈");
    expect(rankLabel(2)).toBe("🥉");
  });

  it("returns 1-based number strings for positions beyond three", () => {
    expect(rankLabel(3)).toBe("4");
    expect(rankLabel(9)).toBe("10");
    expect(rankLabel(99)).toBe("100");
  });
});

// ── canAwardPoints ────────────────────────────────────────────────────────────

describe("canAwardPoints", () => {
  it("returns true for adults", () => {
    expect(canAwardPoints({ role: "adult" })).toBe(true);
  });

  it("returns false for children", () => {
    expect(canAwardPoints({ role: "child" })).toBe(false);
  });

  it("returns false for null or undefined ME", () => {
    expect(canAwardPoints(null)).toBe(false);
    expect(canAwardPoints(undefined)).toBe(false);
  });

  it("returns false for an unknown role", () => {
    expect(canAwardPoints({ role: "guest" })).toBe(false);
  });
});
