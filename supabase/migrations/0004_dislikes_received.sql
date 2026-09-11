-- Редизайн профиля добавляет плитку "МИНУСОВ" — суммарные дизлайки, полученные
-- за все матчи. Считается и накапливается в recordMatchResultForUser.

alter table public.users
  add column if not exists dislikes_received integer not null default 0;
