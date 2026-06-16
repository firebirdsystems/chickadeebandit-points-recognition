SELECT
  a.id,
  a.member_id,
  a.points,
  a.note,
  a.awarded_by,
  a.awarded_at,
  c.name AS category_name,
  c.icon AS category_icon,
  p.name AS period_name,
  p.is_active AS period_is_active
FROM app_points_recognition__pr_awards a
JOIN app_points_recognition__pr_categories c ON c.id = a.category_id
JOIN app_points_recognition__pr_periods p ON p.id = a.period_id
ORDER BY a.awarded_at DESC
LIMIT 200