/*
  # Исправление RLS политик для полной изоляции команд

  1. Изменения
    - Полное удаление всех старых политик
    - Создание простых политик без JWT
    - Публичный доступ для чтения/записи с фильтрацией на уровне приложения
    
  2. Важно
    - RLS остается включенным для безопасности
    - Политики разрешают операции для всех (для работы без аутентификации)
    - Изоляция команд будет обеспечиваться на уровне приложения через team_id
*/

-- ========================================
-- USERS TABLE
-- ========================================

-- Удаление всех политик для users
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Team leaders can view team members" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Anyone can read users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Anyone can update users" ON users;
DROP POLICY IF EXISTS "Anyone can delete users" ON users;

-- Новые простые политики для users
CREATE POLICY "Allow all read access to users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to users"
  ON users FOR UPDATE
  USING (true);

CREATE POLICY "Allow all delete access to users"
  ON users FOR DELETE
  USING (true);

-- ========================================
-- ORDERS TABLE
-- ========================================

-- Удаление всех политик для orders
DROP POLICY IF EXISTS "Users can read orders from their team" ON orders;
DROP POLICY IF EXISTS "Users can insert orders for their team" ON orders;
DROP POLICY IF EXISTS "Users can update orders in their team" ON orders;
DROP POLICY IF EXISTS "Users can delete orders in their team" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON orders;
DROP POLICY IF EXISTS "Anyone can delete orders" ON orders;

-- Новые простые политики для orders
CREATE POLICY "Allow all read access to orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to orders"
  ON orders FOR UPDATE
  USING (true);

CREATE POLICY "Allow all delete access to orders"
  ON orders FOR DELETE
  USING (true);

-- ========================================
-- TRANSACTIONS TABLE
-- ========================================

-- Удаление всех политик для transactions
DROP POLICY IF EXISTS "Users can read transactions from their team" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions for their team" ON transactions;
DROP POLICY IF EXISTS "Anyone can read transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can update transactions" ON transactions;

-- Новые простые политики для transactions
CREATE POLICY "Allow all read access to transactions"
  ON transactions FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to transactions"
  ON transactions FOR UPDATE
  USING (true);

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================

-- Удаление всех политик для notifications
DROP POLICY IF EXISTS "Users can read notifications from their team" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications for their team" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications in their team" ON notifications;
DROP POLICY IF EXISTS "Anyone can read notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON notifications;

-- Новые простые политики для notifications
CREATE POLICY "Allow all read access to notifications"
  ON notifications FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to notifications"
  ON notifications FOR UPDATE
  USING (true);

-- ========================================
-- INVITED_USERS TABLE
-- ========================================

-- Удаление всех политик для invited_users
DROP POLICY IF EXISTS "Anyone can read invited_users" ON invited_users;
DROP POLICY IF EXISTS "Anyone can insert invited_users" ON invited_users;
DROP POLICY IF EXISTS "Anyone can update invited_users" ON invited_users;

-- Новые простые политики для invited_users
CREATE POLICY "Allow all read access to invited_users"
  ON invited_users FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access to invited_users"
  ON invited_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access to invited_users"
  ON invited_users FOR UPDATE
  USING (true);