/*
  # Добавление изоляции данных между командами

  1. Изменения
    - Добавление поля `team_id` в таблицу users (идентификатор команды)
    - Для админа - team_id = его собственный token
    - Для тимлида - team_id = его собственный token
    - Для члена команды - team_id = token его тимлида
    
  2. Обновление политик RLS
    - Заказы видны только членам одной команды
    - Уведомления видны только членам одной команды
    - Транзакции видны только членам одной команды

  3. Безопасность
    - Админ видит все данные
    - Тимлид видит данные своей команды
    - Член команды видит данные своей команды
*/

-- Добавление поля team_id в таблицу users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE users ADD COLUMN team_id text;
  END IF;
END $$;

-- Создание индекса для быстрого поиска по team_id
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);

-- Обновление существующих пользователей
-- Для админов - team_id = их собственный token
UPDATE users 
SET team_id = token 
WHERE role = 'admin' AND team_id IS NULL;

-- Для тимлидов - team_id = их собственный token
UPDATE users 
SET team_id = token 
WHERE role = 'team-leader' AND team_id IS NULL;

-- Для членов команды - team_id = token тимлида (invited_by_token)
UPDATE users 
SET team_id = invited_by_token 
WHERE role = 'team-member' AND team_id IS NULL;

-- Добавление поля team_id в таблицу orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN team_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_team_id ON orders(team_id);

-- Добавление поля team_id в таблицу notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN team_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);

-- Добавление поля team_id в таблицу transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN team_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_transactions_team_id ON transactions(team_id);

-- Удаление старых политик для orders
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;

-- Новые политики для orders (изоляция по командам)
CREATE POLICY "Users can read orders from their team"
  ON orders FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
    OR
    team_id IN (
      SELECT token FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token' AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert orders for their team"
  ON orders FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
  );

CREATE POLICY "Users can update orders in their team"
  ON orders FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
  );

CREATE POLICY "Users can delete orders in their team"
  ON orders FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
  );

-- Удаление старых политик для notifications
DROP POLICY IF EXISTS "Anyone can read notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON notifications;

-- Новые политики для notifications (изоляция по командам)
CREATE POLICY "Users can read notifications from their team"
  ON notifications FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
    OR
    team_id IN (
      SELECT token FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token' AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert notifications for their team"
  ON notifications FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
  );

CREATE POLICY "Users can update notifications in their team"
  ON notifications FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
  );

-- Удаление старых политик для transactions
DROP POLICY IF EXISTS "Anyone can read transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON transactions;

-- Новые политики для transactions (изоляция по командам)
CREATE POLICY "Users can read transactions from their team"
  ON transactions FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
    OR
    team_id IN (
      SELECT token FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token' AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert transactions for their team"
  ON transactions FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM users WHERE token = current_setting('request.jwt.claims', true)::json->>'user_token'
    )
  );