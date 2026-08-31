-- member_history orders by awarded_at DESC under LIMIT 200. Awards accumulate
-- for the life of the household, so the scan this replaces grows without bound.
CREATE INDEX IF NOT EXISTS idx_pr_awards_awarded_at
  ON app_points_recognition__pr_awards(awarded_at);
