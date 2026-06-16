CREATE TABLE IF NOT EXISTS app_points_recognition__pr_periods (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  started_at   TEXT NOT NULL,
  closed_at    TEXT,
  is_active    INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL,
  created_by   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS app_points_recognition__pr_categories (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT '⭐',
  description  TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL,
  created_by   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS app_points_recognition__pr_awards (
  id           TEXT PRIMARY KEY,
  period_id    TEXT NOT NULL,
  category_id  TEXT NOT NULL,
  member_id    TEXT NOT NULL,
  points       INTEGER NOT NULL,
  note         TEXT NOT NULL DEFAULT '',
  awarded_by   TEXT NOT NULL DEFAULT '',
  awarded_at   TEXT NOT NULL
);
