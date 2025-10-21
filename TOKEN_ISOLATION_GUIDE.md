# Изоляция заказов по токенам

## Проблема
Когда создаются новые пользователи по пригласительным токенам, они видели заказы других пользователей, созданных по тем же пригласительным токенам.

**Пример проблемы:**
1. Создали пригласительный токен `tl_abc123_f4d2dsfre3`
2. По нему зарегистрировался User1 с токеном `tm_xyz789`
3. User1 создал заказ
4. Создали новый пригласительный токен `tl_def456_f4d2dsfre3`
5. По нему зарегистрировался User2 с токеном `tm_qwe321`
6. User2 видит заказ User1 (потому что у обоих `parent_token = f4d2dsfre3`)

## Решение
Реализована полная изоляция заказов через поле `team_id`:

### 1. Структура team_id

Каждый пользователь имеет `team_id` равный **собственному токену**:
- **Admin**: `team_id = собственный token`
- **Team Leader**: `team_id = собственный token`
- **Team Member**: `team_id = собственный token` (ПОЛНАЯ ИЗОЛЯЦИЯ)

### 2. Автоматическая установка team_id

При создании записей автоматически устанавливается `team_id` через триггеры базы данных:

- **Users**: триггер `trg_set_user_team_id` устанавливает `team_id` при создании/обновлении пользователя
- **Orders**: триггер `trg_set_order_team_id` копирует `team_id` создателя в заказ
- **Transactions**: триггер `trg_set_transaction_team_id` копирует `team_id` пользователя
- **Notifications**: триггер `trg_set_notification_team_id` копирует `team_id` пользователя

### 3. Фильтрация данных

При загрузке заказов:
- **Admin** видит все заказы (без фильтра)
- **Остальные** видят только заказы, где `team_id = их team_id`

Код в `App.tsx`:
```typescript
if (userData.role === 'admin') {
  // Загрузка всех заказов
  const { data } = await supabase.from('orders').select('*');
} else {
  // Загрузка только заказов своей команды
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('team_id', userTeamId);
}
```

### 4. Создание заказа

При создании нового заказа:
1. Получаем `team_id` текущего пользователя из базы данных
2. Устанавливаем это значение в поле `team_id` заказа
3. Триггер базы данных автоматически проверяет и устанавливает правильный `team_id`

## Результат

✅ Каждый токен видит только свои собственные заказы
✅ Заказы автоматически привязываются к правильному team_id (токену создателя)
✅ Администратор видит все заказы
✅ Разные пользователи, даже с одним parent_token, полностью изолированы друг от друга
✅ Нет утечек данных между пользователями

## Исправления в коде

### 1. Сохранение пользователей в базу данных (App.tsx)

При создании пользователя по пригласительному токену:
```typescript
const newUserData = {
  token: generatedToken,
  name: 'User',
  role: 'team-member',
  parent_token: actualParentToken,
  invited_by_token: actualParentToken,
  // team_id будет установлен триггером = generatedToken
};

await supabase.from('users').insert(newUserData);
```

### 2. Триггер базы данных (миграция 20251021140000)

```sql
CREATE OR REPLACE FUNCTION set_user_team_id()
RETURNS trigger AS $$
BEGIN
  -- Для ВСЕХ ролей: team_id = собственный token
  NEW.team_id := NEW.token;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. Загрузка team_id при создании заказа (App.tsx)

```typescript
const { data: currentUserData } = await supabase
  .from('users')
  .select('team_id')
  .eq('token', currentUserToken)
  .maybeSingle();

const userTeamId = currentUserData?.team_id || currentUserToken;
```
