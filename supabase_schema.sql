-- SUPABASE SCHEMA SETUP (COMPLETE & CORRECT)
-- 1. Open your Supabase project -> SQL Editor
-- 2. Click "New Query"
-- 3. PASTE THE ENTIRE BLOCK BELOW
-- 4. Click "Run"

-- DROP OLD TABLES TO ENSURE CLEAN START (Prototyping phase)
drop table if exists messages;
drop table if exists complaints;
drop table if exists users;

-- Enable required extension
create extension if not exists pgcrypto;

-- 1. USERS TABLE
create table users (
  id uuid primary key references auth.users on delete cascade,
  name text,
  email text unique,
  role text check (role in ('student','admin')) default 'student',
  created_at timestamp with time zone default now()
);

-- 2. COMPLAINTS TABLE
create table complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  description text not null,
  category text,
  department text,
  priority text check (priority in ('Low','Medium','High','Critical')),
  status text check (status in ('Pending','In Progress','Resolved')) default 'Pending',
  assigned_to text,
  image_url text, -- For storing base64 or storage links
  is_anonymous boolean default false,
  ai_explanation text,
  ai_summary text,
  ai_sentiment text,
  ai_urgency_score numeric,
  resolution_estimate numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. MESSAGES TABLE
create table messages (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid references complaints(id) on delete cascade,
  sender_id uuid references auth.users on delete cascade,
  sender_role text check (sender_role in ('student','admin')),
  message text,
  message_type text check (message_type in ('text', 'file', 'voice')) default 'text',
  attachment_url text,
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- ENABLE REALTIME
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table users;
alter publication supabase_realtime add table complaints;
alter publication supabase_realtime add table messages;

-- ENABLE RLS
alter table users enable row level security;
alter table complaints enable row level security;
alter table messages enable row level security;

-- POLICIES: USERS
create policy "Public profiles are viewable by everyone" on users for select using (true);
create policy "Users can manage their own profile" on users for all using (auth.uid() = id);

-- POLICIES: COMPLAINTS
create policy "Viewable complaints" on complaints for select using (
  is_anonymous = false or auth.uid() = user_id or (exists (select 1 from users where id = auth.uid() and role = 'admin'))
);
create policy "Users can create complaints" on complaints for insert with check (auth.uid() = user_id);
create policy "Admins can update complaints" on complaints for update using (exists (select 1 from users where id = auth.uid() and role = 'admin'));
create policy "Users can delete their own pending complaints" on complaints for delete using (auth.uid() = user_id and status = 'Pending');

-- POLICIES: MESSAGES
create policy "Messages viewable by all" on messages for select using (true);
create policy "Authenticated users can send messages" on messages for insert with check (auth.role() = 'authenticated');

-- INDEXES
create index idx_complaints_status on complaints(status);
create index idx_complaints_user on complaints(user_id);
create index idx_messages_complaint on messages(complaint_id);

-- AUTO UPDATE TIMESTAMP FUNCTION
create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_complaints_timestamp
before update on complaints
for each row execute procedure update_timestamp();
