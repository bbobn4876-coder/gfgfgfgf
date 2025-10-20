/*
  # Создание функции для увеличения токенов пользователя

  1. Функция
    - `increment_user_tokens(user_token text, amount numeric)` - Увеличивает tokens_added пользователя
    - Безопасно обновляет баланс токенов
    - Возвращает обновленное значение tokens_added

  2. Безопасность
    - Функция SECURITY DEFINER для выполнения от имени владельца
    - Проверка существования пользователя перед обновлением
    - Защита от отрицательных значений

  3. Примечания
    - Используется при пополнении баланса
    - Автоматически обновляет updated_at
*/

-- Создание функции для увеличения токенов пользователя
CREATE OR REPLACE FUNCTION increment_user_tokens(
  user_token text,
  amount numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_balance numeric;
BEGIN
  -- Проверка что amount положительный
  IF amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Обновление tokens_added и получение нового значения
  UPDATE users
  SET 
    tokens_added = tokens_added + amount,
    updated_at = now()
  WHERE token = user_token
  RETURNING tokens_added INTO new_balance;

  -- Проверка что пользователь существует
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'User with token % not found', user_token;
  END IF;

  RETURN new_balance;
END;
$$;