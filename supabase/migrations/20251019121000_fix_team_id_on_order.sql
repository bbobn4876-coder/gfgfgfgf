/*
  # Ensure orders.team_id is set via trigger if client omitted/mis-set it

  - Creates function to fill team_id on insert from users.team_id based on created_by_token
  - Creates trigger on orders BEFORE INSERT
*/

CREATE OR REPLACE FUNCTION set_order_team_id()
RETURNS trigger AS $$
DECLARE
  v_team_id text;
BEGIN
  IF NEW.team_id IS NULL OR NEW.team_id = '' THEN
    SELECT team_id INTO v_team_id FROM users WHERE token = NEW.created_by_token LIMIT 1;
    IF v_team_id IS NOT NULL THEN
      NEW.team_id := v_team_id;
    ELSE
      NEW.team_id := NEW.created_by_token;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_order_team_id ON orders;
CREATE TRIGGER trg_set_order_team_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_order_team_id();


