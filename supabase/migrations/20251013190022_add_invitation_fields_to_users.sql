/*
  # Добавление полей приглашения в таблицу users

  1. Изменения
    - Добавить в таблицу `users`:
      - `username_tm` (text, nullable) - Никнейм тимлида, который пригласил этого пользователя
      - `username_tu` (text, nullable) - Никнейм члена команды (если это член команды)
      - `invited_by_token` (text, nullable) - Token пользователя, который пригласил

  2. Логика заполнения
    - Когда Админ приглашает Тимлида:
      * token = токен нового тимлида
      * username_tm = никнейм этого тимлида
      * role = 'team-leader'
      * invited_by_token = токен админа
    
    - Когда Тимлид приглашает Члена команды:
      * token = токен нового члена команды
      * username_tm = никнейм тимлида (который его пригласил)
      * username_tu = никнейм этого члена команды
      * role = 'team-member'
      * invited_by_token = токен тимлида

  3. Индексы
    - Индекс на invited_by_token для быстрого поиска приглашенных

  4. Примечания
    - Все новые поля nullable, чтобы не нарушить существующие данные
    - username_tm: всегда содержит никнейм тимлида в иерархии
    - username_tu: содержит никнейм только для членов команды
*/

-- Добавление новых полей в таблицу users
DO $$
BEGIN
  -- Добавить username_tm если не существует
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username_tm'
  ) THEN
    ALTER TABLE users ADD COLUMN username_tm text;
  END IF;

  -- Добавить username_tu если не существует
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username_tu'
  ) THEN
    ALTER TABLE users ADD COLUMN username_tu text;
  END IF;

  -- Добавить invited_by_token если не существует
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'invited_by_token'
  ) THEN
    ALTER TABLE users ADD COLUMN invited_by_token text;
  END IF;
END $$;

-- Создание индекса на invited_by_token
CREATE INDEX IF NOT EXISTS idx_users_invited_by_token ON users(invited_by_token);

-- Создание индекса на username_tm для быстрого поиска по тимлидам
CREATE INDEX IF NOT EXISTS idx_users_username_tm ON users(username_tm);

-- Комментарии для документации
COMMENT ON COLUMN users.username_tm IS 'Никнейм тимлида в иерархии приглашений';
COMMENT ON COLUMN users.username_tu IS 'Никнейм члена команды (только для роли team-member)';
COMMENT ON COLUMN users.invited_by_token IS 'Token пользователя, который пригласил этого пользователя';