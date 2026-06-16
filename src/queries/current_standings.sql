SELECT
  a.member_id,
  SUM(a.points) AS total_points,
  COUNT(*) AS award_count
FROM app_points_recognition__pr_awards a
JOIN app_points_recognition__pr_periods p ON p.id = a.period_id
WHERE p.is_active = 1
GROUP BY a.member_id
ORDER BY total_points DESC
LIMIT 100