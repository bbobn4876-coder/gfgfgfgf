/*
  # Исправление изоляции для team-member

  1. Проблема
    - Когда создаются разные пользователи по разным пригласительным токенам
    - Они получают одинаковый parent_token (токен создателя)
    - Из-за этого у них одинаковый team_id
    - И они видят заказы друг друга

  2. Решение
    - Team-member, созданный по пригласительному токену, должен иметь team_id = собственный token
    - Это полностью изолирует каждого пользователя
    - Только админ видит все заказы

  3. Логика team_id
    - Admin: team_id = собственный token
    - Team-leader: team_id = собственный token (НЕ МЕНЯЕТСЯ)
    - Team-member (создан по invite): team_id = собственный token (НОВАЯ ЛОГИКА)
*/

-- Обновляем функцию установки team_id для пользователей
CREATE OR REPLACE FUNCTION set_user_team_id()
RETURNS trigger AS $$
BEGIN
  -- Для админа и team-leader: team_id = собственный token
  IF NEW.role IN ('admin', 'team-leader') THEN
    NEW.team_id := NEW.token;
  -- Для team-member: team_id = собственный token (полная изоляция)
  ELSIF NEW.role = 'team-member' THEN
    NEW.team_id := NEW.token;
  -- Fallback: team_id = собственный token
  ELSE
    NEW.team_id := NEW.token;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Обновляем team_id у существующих team-member пользователей
-- Каждый team-member теперь получает свой собственный team_id
UPDATE users
SET team_id = token
WHERE role = 'team-member'
  AND (team_id IS NULL OR team_id != token);

-- Обновляем team_id заказов в соответствии с новым team_id создателей
UPDATE orders o
SET team_id = u.team_id
FROM users u
WHERE o.created_by_token = u.token
  AND o.team_id != u.team_id;
