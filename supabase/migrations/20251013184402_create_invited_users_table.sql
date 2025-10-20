/*
  # Создание таблицы приглашенных пользователей

  1. Новая таблица
    - `invited_users`
      - `id` (uuid, primary key) - Уникальный идентификатор записи
      - `user_token` (text, unique, not null) - Token приглашенного пользователя
      - `username_tm` (text, nullable) - Никнейм тимлида, который пригласил этого пользователя
      - `username_tu` (text, nullable) - Никнейм члена команды (если пригласил тимлид)
      - `role` (text, not null) - Роль пользователя ('team-leader' или 'team-member')
      - `invited_by_token` (text, nullable) - Token пользователя, который пригласил
      - `created_at` (timestamptz) - Дата создания записи
      - `updated_at` (timestamptz) - Дата последнего обновления

  2. Безопасность
    - Включить RLS для таблицы invited_users
    - Админ может видеть все записи
    - Тимлид может видеть своих приглашенных
    - Член команды может видеть только свою запись

  3. Индексы
    - Индекс на user_token для быстрого поиска
    - Индекс на invited_by_token для поиска по приглашающему
    - Индекс на role для фильтрации по ролям

  4. Примечания
    - username_tm: никнейм тимлида (заполняется если админ пригласил тимлида, или если тимлид пригласил члена команды)
    - username_tu: никнейм члена команды (заполняется если тимлид пригласил члена команды)
    - Иерархия: Admin → TeamLead (username_tm) → TeamMember (username_tu)
*/

-- Создание таблицы приглашенных пользователей
CREATE TABLE IF NOT EXISTS invited_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_token text UNIQUE NOT NULL,
  username_tm text,
  username_tu text,
  role text NOT NULL DEFAULT 'team-member',
  invited_by_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_invited_users_token ON invited_users(user_token);
CREATE INDEX IF NOT EXISTS idx_invited_users_invited_by ON invited_users(invited_by_token);
CREATE INDEX IF NOT EXISTS idx_invited_users_role ON invited_users(role);

-- Включение RLS
ALTER TABLE invited_users ENABLE ROW LEVEL SECURITY;

-- Политика: Админ может видеть все записи
CREATE POLICY "Admin can view all invited users"
  ON invited_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.token = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Политика: Тимлид может видеть своих приглашенных
CREATE POLICY "Team leader can view own invited users"
  ON invited_users FOR SELECT
  TO authenticated
  USING (
    invited_by_token = auth.uid()::text OR
    username_tm IN (
      SELECT nickname FROM users WHERE token = auth.uid()::text AND role = 'team-leader'
    )
  );

-- Политика: Пользователь может видеть свою запись
CREATE POLICY "Users can view own record"
  ON invited_users FOR SELECT
  TO authenticated
  USING (user_token = auth.uid()::text);

-- Политика: Админ и тимлид могут создавать записи о приглашенных
CREATE POLICY "Admin and team leader can insert invited users"
  ON invited_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.token = auth.uid()::text 
      AND (users.role = 'admin' OR users.role = 'team-leader')
    )
  );

-- Политика: Админ и приглашающий могут обновлять записи
CREATE POLICY "Admin and inviter can update invited users"
  ON invited_users FOR UPDATE
  TO authenticated
  USING (
    invited_by_token = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.token = auth.uid()::text 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    invited_by_token = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.token = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Политика: Только админ может удалять записи
CREATE POLICY "Only admin can delete invited users"
  ON invited_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.token = auth.uid()::text 
      AND users.role = 'admin'
    )
  );