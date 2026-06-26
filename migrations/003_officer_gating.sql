-- Officer-group gating: awards/categories/periods become writable only by a
-- configured "officers" group (manifest row policies owner_or_visibility +
-- write_privileged_only + bypass_group_setting). Everyone still reads (the
-- leaderboard is public), so each row carries a plaintext `visibility` column
-- defaulting to 'everyone'. The officers group pointer lives in an app_config
-- key/value table writable only through the admin-only /api/admin-config endpoint.

CREATE TABLE IF NOT EXISTS app_points_recognition__pr_settings (
  key   TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

ALTER TABLE app_points_recognition__pr_awards     ADD COLUMN visibility TEXT NOT NULL DEFAULT 'everyone';
ALTER TABLE app_points_recognition__pr_categories ADD COLUMN visibility TEXT NOT NULL DEFAULT 'everyone';
ALTER TABLE app_points_recognition__pr_periods    ADD COLUMN visibility TEXT NOT NULL DEFAULT 'everyone';
