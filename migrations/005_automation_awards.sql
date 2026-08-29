-- Automations award points on another app's event
-- (manifest.automation_actions.award).
--
-- `source_event_id` records which app event produced the award. The
-- dispatcher's dedupe guard reads it before running an action (SELECT 1 ...
-- WHERE source_event_id = ? LIMIT 1), so one completed chore or one streak
-- milestone can never be paid out twice.
--
-- Nullable on purpose: awards given by an officer in the app leave it NULL.
ALTER TABLE app_points_recognition__pr_awards ADD COLUMN source_event_id TEXT;

CREATE INDEX IF NOT EXISTS idx_pr_awards_source_event_id
  ON app_points_recognition__pr_awards(source_event_id);

-- Every award needs a category, and an automation has no officer standing at a
-- picker to choose one. Seed a fixed category the action can name as a literal
-- ('automation') rather than looking one up: category names are encrypted at
-- rest, so a WHERE against one would match nothing, silently and forever.
--
-- Written as plaintext deliberately. Migrations run outside the app-db codec,
-- and reads decrypt only values that carry the ciphertext marker — a plaintext
-- name is returned as-is, so this row renders like any other category.
-- cb:plaintext-literal name — one fixed seed row the award action names as a literal; category names written by an officer stay encrypted
-- cb:plaintext-literal description — the seeded automation category below; officer-written descriptions stay encrypted
INSERT OR IGNORE INTO app_points_recognition__pr_categories
  (id, name, icon, description, created_at, created_by, visibility)
VALUES (
  'automation',
  'Automations',
  '🤖',
  'Points awarded automatically by a household automation rule.',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  'system',
  'everyone'
);
