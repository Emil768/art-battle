-- Замена картинок-референсов на текстовые задания: рисовать по картинке
-- сложно, и хранить кучу изображений в базе/сторадже незачем — вместо этого
-- игрокам показывается короткая текстовая подсказка "что нарисовать".

create table if not exists public.drawing_prompts (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  is_active boolean not null default true
);

alter table public.drawing_prompts enable row level security;

create policy "drawing prompts public read" on public.drawing_prompts
  for select using (is_active = true);

alter table public.rooms
  add column if not exists prompt_id uuid references public.drawing_prompts (id);

alter table public.rooms drop column if exists reference_image_id;

drop table if exists public.reference_images cascade;
