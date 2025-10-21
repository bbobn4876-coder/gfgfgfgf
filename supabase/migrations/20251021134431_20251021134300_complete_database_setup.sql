/*
  # Полная настройка базы данных с изоляцией по токенам

  1. Создание таблиц
    - users: пользователи системы
    - orders: заказы пользователей
    - transactions: транзакции
    - notifications: уведомления

  2. Изоляция по team_id
    - Каждый пользователь имеет team_id
    - admin и team-leader: team_id = их собственный token
    - team-member: team_id = token их тимлида
    - Заказы автоматически получают team_id создателя
    - Каждый токен видит только заказы своей команды

  3. RLS политики
    - Политики используют USING (true) для совместимости с кастомной аутентификацией
    - Изоляция обеспечивается на уровне приложения через фильтрацию по team_id
*/

-- ==========================================
-- ТАБЛИЦА USERS
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  nickname text NOT NULL DEFAULT '',
  parent_token text,
  role text NOT NULL DEFAULT 'team-member',
  ip text NOT NULL DEFAULT '',
  avatar text,
  tokens_added numeric NOT NULL DEFAULT 0,
  tokens_spent numeric NOT NULL DEFAULT 0,
  is_online boolean NOT NULL DEFAULT false,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  team_id text,
  invited_by_token text,
  invite_token text
);

CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_users_parent_token ON users(parent_token);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read access to users" ON users;
DROP POLICY IF EXISTS "Allow all insert access to users" ON users;
DROP POLICY IF EXISTS "Allow all update access to users" ON users;
DROP POLICY IF EXISTS "Allow all delete access to users" ON users;

CREATE POLICY "Allow all read access to users"
  ON users FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to users"
  ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update access to users"
  ON users FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete access to users"
  ON users FOR DELETE USING (true);

-- ==========================================
-- ТАБЛИЦА ORDERS
-- ==========================================

CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'progress',
  created_by_token text NOT NULL,
  order_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  date text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  team_id text,
  order_number text
);

CREATE INDEX IF NOT EXISTS idx_orders_created_by_token ON orders(created_by_token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_team_id ON orders(team_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow all insert access to orders" ON orders;
DROP POLICY IF EXISTS "Allow all update access to orders" ON orders;
DROP POLICY IF EXISTS "Allow all delete access to orders" ON orders;

CREATE POLICY "Allow all read access to orders"
  ON orders FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update access to orders"
  ON orders FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete access to orders"
  ON orders FOR DELETE USING (true);

-- ==========================================
-- ТАБЛИЦА TRANSACTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS transactions (
  id serial PRIMARY KEY,
  user_token text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  description text,
  created_at timestamptz DEFAULT now(),
  team_id text
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_token ON transactions(user_token);
CREATE INDEX IF NOT EXISTS idx_transactions_team_id ON transactions(team_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read access to transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all insert access to transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all update access to transactions" ON transactions;

CREATE POLICY "Allow all read access to transactions"
  ON transactions FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to transactions"
  ON transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update access to transactions"
  ON transactions FOR UPDATE USING (true) WITH CHECK (true);

-- ==========================================
-- ТАБЛИЦА NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
  id serial PRIMARY KEY,
  user_token text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  team_id text
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_token ON notifications(user_token);
CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read access to notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all insert access to notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all update access to notifications" ON notifications;

CREATE POLICY "Allow all read access to notifications"
  ON notifications FOR SELECT USING (true);

CREATE POLICY "Allow all insert access to notifications"
  ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update access to notifications"
  ON notifications FOR UPDATE USING (true) WITH CHECK (true);

-- ==========================================
-- ФУНКЦИЯ ДЛЯ АВТОМАТИЧЕСКОЙ УСТАНОВКИ TEAM_ID
-- ==========================================

-- Функция для установки team_id у пользователя при создании/обновлении
CREATE OR REPLACE FUNCTION set_user_team_id()
RETURNS trigger AS $$
BEGIN
  -- Если role = admin или team-leader, team_id = собственный token
  IF NEW.role IN ('admin', 'team-leader') THEN
    NEW.team_id := NEW.token;
  -- Если role = team-member, team_id = parent_token (токен тимлида)
  ELSIF NEW.role = 'team-member' AND NEW.parent_token IS NOT NULL THEN
    NEW.team_id := NEW.parent_token;
  -- Если parent_token пустой, используем invited_by_token
  ELSIF NEW.role = 'team-member' AND NEW.invited_by_token IS NOT NULL THEN
    NEW.team_id := NEW.invited_by_token;
  -- Fallback: team_id = собственный token
  ELSE
    NEW.team_id := NEW.token;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_user_team_id ON users;
CREATE TRIGGER trg_set_user_team_id
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_user_team_id();

-- Функция для автоматической установки team_id у заказа
CREATE OR REPLACE FUNCTION set_order_team_id()
RETURNS trigger AS $$
DECLARE
  v_team_id text;
BEGIN
  -- Получаем team_id пользователя, создающего заказ
  SELECT team_id INTO v_team_id 
  FROM users 
  WHERE token = NEW.created_by_token 
  LIMIT 1;
  
  -- Если нашли team_id, устанавливаем его
  IF v_team_id IS NOT NULL AND v_team_id != '' THEN
    NEW.team_id := v_team_id;
  ELSE
    -- Если team_id не найден, используем токен создателя как fallback
    NEW.team_id := NEW.created_by_token;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_team_id ON orders;
CREATE TRIGGER trg_set_order_team_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_team_id();

-- Функция для автоматической установки team_id у транзакции
CREATE OR REPLACE FUNCTION set_transaction_team_id()
RETURNS trigger AS $$
DECLARE
  v_team_id text;
BEGIN
  SELECT team_id INTO v_team_id 
  FROM users 
  WHERE token = NEW.user_token 
  LIMIT 1;
  
  IF v_team_id IS NOT NULL AND v_team_id != '' THEN
    NEW.team_id := v_team_id;
  ELSE
    NEW.team_id := NEW.user_token;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_transaction_team_id ON transactions;
CREATE TRIGGER trg_set_transaction_team_id
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_transaction_team_id();

-- Функция для автоматической установки team_id у уведомления
CREATE OR REPLACE FUNCTION set_notification_team_id()
RETURNS trigger AS $$
DECLARE
  v_team_id text;
BEGIN
  SELECT team_id INTO v_team_id 
  FROM users 
  WHERE token = NEW.user_token 
  LIMIT 1;
  
  IF v_team_id IS NOT NULL AND v_team_id != '' THEN
    NEW.team_id := v_team_id;
  ELSE
    NEW.team_id := NEW.user_token;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_notification_team_id ON notifications;
CREATE TRIGGER trg_set_notification_team_id
BEFORE INSERT ON notifications
FOR EACH ROW
EXECUTE FUNCTION set_notification_team_id();
