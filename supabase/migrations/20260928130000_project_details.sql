create table if not exists public.project_details (
  id int primary key default 1 check (id = 1),
  slug text not null,
  title text not null,
  tagline text,
  stack text[] not null default '{}',
  repo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.project_details enable row level security;

drop policy if exists "project_details_public_read" on public.project_details;
create policy "project_details_public_read"
  on public.project_details
  for select
  to anon, authenticated
  using (true);

insert into public.project_details (slug, title, tagline, stack, repo_path)
values (
  'ledgro-ai-sb',
  'Ledgro AI SB',
  'Supabase-backed Ledgro AI workspace (patterned after ArhaFoodx-SB).',
  array['Supabase', 'Vite', 'TypeScript'],
  'ledgro-ai'
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  tagline = excluded.tagline,
  stack = excluded.stack,
  repo_path = excluded.repo_path,
  updated_at = now();
