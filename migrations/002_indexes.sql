CREATE UNIQUE INDEX IF NOT EXISTS idx_pr_categories_name
  ON app_points_recognition__pr_categories(name);

CREATE INDEX IF NOT EXISTS idx_pr_awards_period_id
  ON app_points_recognition__pr_awards(period_id);

CREATE INDEX IF NOT EXISTS idx_pr_awards_member_id
  ON app_points_recognition__pr_awards(member_id);
