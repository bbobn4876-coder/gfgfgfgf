-- Функция для users
CREATE OR REPLACE FUNCTION set_user_team_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.team_id IS NULL THEN
    IF NEW.role IN ('admin', 'team-leader') THEN
      NEW.team_id := NEW.token;
    ELSIF NEW.role = 'team-member' THEN
      NEW.team_id := NEW.invited_by_token;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_user_team_id ON users;
CREATE TRIGGER trigger_set_user_team_id
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_team_id();

-- Функция для orders
CREATE OR REPLACE FUNCTION set_order_team_id()
RETURNS TRIGGER AS $$
DECLARE
  user_team_id text;
BEGIN
  IF NEW.team_id IS NULL THEN
    SELECT team_id INTO user_team_id FROM users WHERE token = NEW.created_by_token;
    NEW.team_id := COALESCE(user_team_id, NEW.created_by_token);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_team_id ON orders;
CREATE TRIGGER trigger_set_order_team_id
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_team_id();