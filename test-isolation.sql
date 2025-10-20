-- Тестовый скрипт для проверки изоляции команд
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Очистка данных
DELETE FROM orders;
DELETE FROM transactions;
DELETE FROM notifications;
DELETE FROM users;

-- 2. Создание админа
INSERT INTO users (token, nickname, name, role, ip, tokens_added, tokens_spent, is_online)
VALUES ('admin_token_123', 'Admin', 'Super Admin', 'admin', '127.0.0.1', 0, 0, true);

-- 3. Создание Тимлида A
INSERT INTO users (token, nickname, name, username_tm, role, invited_by_token, ip, tokens_added, tokens_spent, is_online)
VALUES ('teamlead_A_token', 'TeamLeadA', 'Team Lead A', 'TeamLeadA', 'team-leader', 'admin_token_123', '192.168.1.1', 0, 0, true);

-- 4. Создание Тимлида B
INSERT INTO users (token, nickname, name, username_tm, role, invited_by_token, ip, tokens_added, tokens_spent, is_online)
VALUES ('teamlead_B_token', 'TeamLeadB', 'Team Lead B', 'TeamLeadB', 'team-leader', 'admin_token_123', '192.168.1.2', 0, 0, true);

-- 5. Создание члена команды A
INSERT INTO users (token, nickname, name, username_tm, username_tu, role, invited_by_token, ip, tokens_added, tokens_spent, is_online)
VALUES ('member_A1_token', 'MemberA1', 'Member A1', 'TeamLeadA', 'MemberA1', 'team-member', 'teamlead_A_token', '192.168.1.3', 0, 0, true);

-- 6. Создание члена команды B
INSERT INTO users (token, nickname, name, username_tm, username_tu, role, invited_by_token, ip, tokens_added, tokens_spent, is_online)
VALUES ('member_B1_token', 'MemberB1', 'Member B1', 'TeamLeadB', 'MemberB1', 'team-member', 'teamlead_B_token', '192.168.1.4', 0, 0, true);

-- 7. Проверка team_id у пользователей
SELECT
  nickname,
  role,
  token,
  team_id,
  invited_by_token,
  CASE
    WHEN role = 'team-leader' AND team_id = token THEN '✓ Правильно'
    WHEN role = 'team-member' AND team_id = invited_by_token THEN '✓ Правильно'
    WHEN role = 'admin' AND team_id = token THEN '✓ Правильно'
    ELSE '✗ ОШИБКА'
  END as status
FROM users
ORDER BY created_at;

-- 8. Создание заказов для команды A
INSERT INTO orders (name, status, created_by_token, order_data, date)
VALUES
  ('Заказ A1 от Тимлида', 'progress', 'teamlead_A_token', '{"description": "Landing page"}', '2025-10-13'),
  ('Заказ A2 от Члена', 'progress', 'member_A1_token', '{"description": "Blog"}', '2025-10-13');

-- 9. Создание заказов для команды B
INSERT INTO orders (name, status, created_by_token, order_data, date)
VALUES
  ('Заказ B1 от Тимлида', 'progress', 'teamlead_B_token', '{"description": "E-commerce"}', '2025-10-13'),
  ('Заказ B2 от Члена', 'progress', 'member_B1_token', '{"description": "Mobile App"}', '2025-10-13');

-- 10. Проверка team_id у заказов
SELECT
  id,
  name,
  created_by_token,
  team_id,
  CASE
    WHEN created_by_token LIKE '%A%' AND team_id = 'teamlead_A_token' THEN '✓ Команда A'
    WHEN created_by_token LIKE '%B%' AND team_id = 'teamlead_B_token' THEN '✓ Команда B'
    ELSE '✗ ОШИБКА'
  END as status
FROM orders
ORDER BY id;

-- 11. Тест: Заказы для Тимлида A (должны быть только заказы команды A)
SELECT
  '--- Заказы для TeamLeadA ---' as test_name;
SELECT
  o.id,
  o.name,
  o.created_by_token,
  o.team_id
FROM orders o
WHERE o.team_id = (SELECT team_id FROM users WHERE token = 'teamlead_A_token');

-- Ожидаемый результат: 2 заказа (A1 и A2)

-- 12. Тест: Заказы для Тимлида B (должны быть только заказы команды B)
SELECT
  '--- Заказы для TeamLeadB ---' as test_name;
SELECT
  o.id,
  o.name,
  o.created_by_token,
  o.team_id
FROM orders o
WHERE o.team_id = (SELECT team_id FROM users WHERE token = 'teamlead_B_token');

-- Ожидаемый результат: 2 заказа (B1 и B2)

-- 13. Тест: Заказы для Члена команды A (должны быть заказы команды A)
SELECT
  '--- Заказы для MemberA1 ---' as test_name;
SELECT
  o.id,
  o.name,
  o.created_by_token,
  o.team_id
FROM orders o
WHERE o.team_id = (SELECT team_id FROM users WHERE token = 'member_A1_token');

-- Ожидаемый результат: 2 заказа (A1 и A2)

-- 14. Итоговая проверка изоляции
SELECT
  '--- Итоговая проверка изоляции ---' as test_name;
SELECT
  u.nickname as user_name,
  u.role,
  u.team_id,
  COUNT(DISTINCT o.id) as orders_count,
  STRING_AGG(o.name, ', ') as order_names
FROM users u
LEFT JOIN orders o ON o.team_id = u.team_id
WHERE u.role != 'admin'
GROUP BY u.nickname, u.role, u.team_id
ORDER BY u.team_id;

-- Ожидаемый результат:
-- TeamLeadA: 2 заказа (A1, A2)
-- MemberA1: 2 заказа (A1, A2)
-- TeamLeadB: 2 заказа (B1, B2)
-- MemberB1: 2 заказа (B1, B2)