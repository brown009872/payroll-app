-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Employees Table
create table public.employees (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  code text,
  position text,
  department text,
  basic_salary numeric default 0,
  hourly_rate numeric,
  status text default 'active', -- 'active', 'inactive', 'resigned'
  joined_date date,
  resigned_date date,
  leave_start_date date,
  leave_end_date date,
  leave_total_days numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Attendance Table
-- Key is composite logic in app, but in DB we use a UUID ID or composite.
-- App uses `${date}_${employeeId}` as key. We can enforce uniqueness.
create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  in_time text,
  out_time text,
  hourly_rate numeric default 0,
  bonus numeric default 0,
  penalty numeric default 0,
  total_hours numeric default 0,
  provisional_amount numeric default 0,
  day_total numeric default 0,
  holiday_multiplier_type text, -- 'x1', 'x2', ...
  holiday_multiplier_value numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date, employee_id)
);

-- 3. Work Schedule Table
create table public.work_schedules (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  morning boolean default false,
  evening boolean default false,
  morning_new boolean default false,
  evening_new boolean default false,
  custom_shift_enabled boolean default false,
  custom_shift_start text,
  custom_shift_end text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date, employee_id)
);

-- 4. Delay Settings (Weekly)
-- Used for 'Pay Date' calculation.
create table public.delay_settings (
  id uuid primary key default uuid_generate_v4(),
  week_end_date date not null, -- Store the end of week date (e.g. Sunday)
  employee_id uuid references public.employees(id) on delete cascade not null,
  delay_days integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(week_end_date, employee_id)
);

-- Realtime Setup
-- Enable replication for work_schedules (and others if desired) to allow realtime subscription
alter publication supabase_realtime add table public.work_schedules;
alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.employees;
alter publication supabase_realtime add table public.delay_settings;
