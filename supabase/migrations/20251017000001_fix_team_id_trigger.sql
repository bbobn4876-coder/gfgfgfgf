/*
  # Исправление триггера team_id для использования parent_token

  1. Изменения
    - Обновление функции set_user_team_id() для использования parent_token вместо invited_by_token

  2. Логика
    - Для админов и тимлидов: team_id = их собственный token
    - Для членов команды: team_id = parent_token (токен их тимлида)
*/

-- Обновление функции для users
CREATE OR REPLACE FUNCTION set_user_team_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.team_id IS NULL THEN
    IF NEW.role IN ('admin', 'team-leader') THEN
      NEW.team_id := NEW.token;
    ELSIF NEW.role = 'team-member' THEN
      NEW.team_id := NEW.parent_token;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
