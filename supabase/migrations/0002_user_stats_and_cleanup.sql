-- Статистика побед/матчей переносится на users (нужна для профиля и рейтинга),
-- а сами rooms/submissions/votes/match_results после публикации в Telegram
-- удаляются приложением — хранить их в базе долгосрочно смысла нет, картинки
-- уже сохранены в самом Telegram-посте.

alter table public.users
  add column if not exists matches_played integer not null default 0,
  add column if not exists wins integer not null default 0;
