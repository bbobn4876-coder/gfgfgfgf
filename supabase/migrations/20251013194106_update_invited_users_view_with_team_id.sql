/*
  # Обновление представления all_invited_users_view

  1. Изменения
    - Добавление поля team_id в представление
    - Пересоздание представления с новой структурой

  2. Поля представления
    - Все поля из таблицы users
    - invited_by_nickname - никнейм пригласившего пользователя
    - team_id - идентификатор команды
*/

-- Удаление старого представления
DROP VIEW IF EXISTS all_invited_users_view;

-- Создание обновленного представления
CREATE VIEW all_invited_users_view AS
SELECT 
  u.id,
  u.token,
  u.nickname,
  u.name,
  u.username_tm,
  u.username_tu,
  u.role,
  u.invited_by_token,
  u.team_id,
  u.tokens_added,
  u.tokens_spent,
  u.is_online,
  u.created_at,
  u.updated_at,
  inviter.nickname as invited_by_nickname
FROM users u
LEFT JOIN users inviter ON u.invited_by_token = inviter.token
WHERE u.invited_by_token IS NOT NULL;