/*
  # Создание представления для приглашенных пользователей

  1. Представление
    - `all_invited_users_view` - Удобное представление всех приглашенных пользователей
      Показывает:
      - id (uuid)
      - token (приглашенного пользователя)
      - username_tm (никнейм тимлида)
      - username_tu (никнейм члена команды)
      - role (роль: team-leader или team-member)
      - invited_by_token (кто пригласил)
      - invited_by_nickname (никнейм того, кто пригласил)
      - name (имя пользователя)
      - nickname (никнейм пользователя)
      - created_at (дата создания)

  2. Безопасность
    - RLS применяется через базовую таблицу users
    - Представление наследует политики безопасности

  3. Примечания
    - Объединяет данные из users с информацией о приглашающем
    - Показывает только пользователей, у которых заполнен invited_by_token
*/

-- Создание представления для приглашенных пользователей
CREATE OR REPLACE VIEW all_invited_users_view AS
SELECT 
  u.id,
  u.token,
  u.username_tm,
  u.username_tu,
  u.role,
  u.invited_by_token,
  inviter.nickname as invited_by_nickname,
  u.name,
  u.nickname,
  u.avatar,
  u.is_online,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN users inviter ON u.invited_by_token = inviter.token
WHERE u.invited_by_token IS NOT NULL
ORDER BY u.created_at DESC;