-- Create a table for trip data
create table if not exists trips (
  id text primary key,
  content jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table trips enable row level security;

-- Create policy to allow all for public
-- Use DO block to avoid error if policy already exists
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'trips' and policyname = 'Allow public access'
  ) then
    create policy "Allow public access" on trips for all using (true) with check (true);
  end if;
end;
$$;
