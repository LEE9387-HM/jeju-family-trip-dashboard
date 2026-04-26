-- Create a table for trip data
create table trips (
  id text primary key,
  content jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Optional, for now we keep it simple)
alter table trips enable row level security;

-- Create policy to allow all for public (Simple for family use)
create policy "Allow public access" on trips for all using (true);
