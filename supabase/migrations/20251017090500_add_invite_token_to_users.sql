/*
  # Добавление поля invite_token в таблицу users

  1. Изменения
    - Добавить в таблицу `users`:
      - `invite_token` (text, nullable, unique) - Пригласительный токен (tl_ или inv_), использованный для создания этого пользователя

  2. Логика
    - При создании пользователя по приглашению сохраняем пригласительный токен
    - При повторном входе по тому же пригласительному токену находим существующего пользователя
    - Это предотвращает дублирование пользователей при повторных входах

  3. Индексы
    - Индекс на invite_token для быстрого поиска

  4. Примечания
    - Поле nullable, чтобы не нарушить существующие данные
    - Уникальное значение гарантирует один пользователь на один invite токен
*/

-- Добавление поля invite_token в таблицу users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'invite_token'
  ) THEN
    ALTER TABLE users ADD COLUMN invite_token text UNIQUE;
  END IF;
END $$;

-- Создание индекса на invite_token
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);

-- Комментарий для документации
COMMENT ON COLUMN users.invite_token IS 'Пригласительный токен (tl_ или inv_), использованный для создания этого пользователя';
