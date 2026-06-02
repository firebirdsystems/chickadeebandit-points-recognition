SELECT
  a.member_id,
  SUM(a.points) AS total_points,
  COUNT(*) AS award_count
FROM pr_awards a
JOIN pr_periods p ON p.id = a.period_id
WHERE a.household_id = current_setting('app.household_id', true)::uuid
  AND p.is_active = 1
GROUP BY a.member_id
ORDER BY total_points DESC
LIMIT 100