-- Add travel-related tables
create table travel_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('passport', 'visa', 'insurance', 'vaccination', 'other')),
  document_number text,
  issuing_country text,
  issue_date date,
  expiry_date date,
  image_url text,
  status text check (status in ('valid', 'expired', 'pending')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table travel_tickets (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references travel_itineraries(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('flight', 'train', 'bus', 'accommodation', 'event')),
  provider text,
  ticket_number text,
  confirmation_code text,
  qr_code text,
  departure_location text,
  arrival_location text,
  departure_date_time timestamp with time zone,
  arrival_date_time timestamp with time zone,
  seat_info jsonb,
  status text check (status in ('confirmed', 'cancelled', 'used', 'pending')),
  attachment_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table email_integrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text check (provider in ('gmail', 'outlook', 'other')),
  email text not null,
  is_connected boolean default false,
  last_synced timestamp with time zone,
  filters jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table travel_emails (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  email_id text not null,
  subject text not null,
  "from" text not null,
  received_date timestamp with time zone not null,
  type text check (type in ('booking', 'confirmation', 'itinerary', 'ticket', 'other')),
  processed boolean default false,
  linked_booking_id uuid references travel_itineraries(id) on delete set null,
  linked_ticket_id uuid references travel_tickets(id) on delete set null,
  attachments jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table travel_documents enable row level security;
alter table travel_tickets enable row level security;
alter table email_integrations enable row level security;
alter table travel_emails enable row level security;

create policy "Users can view their own travel documents"
  on travel_documents for select
  using (auth.uid() = user_id);

create policy "Users can manage their own travel documents"
  on travel_documents for all
  using (auth.uid() = user_id);

create policy "Users can view their own travel tickets"
  on travel_tickets for select
  using (auth.uid() = user_id);

create policy "Users can manage their own travel tickets"
  on travel_tickets for all
  using (auth.uid() = user_id);

create policy "Users can view their own email integrations"
  on email_integrations for select
  using (auth.uid() = user_id);

create policy "Users can manage their own email integrations"
  on email_integrations for all
  using (auth.uid() = user_id);

create policy "Users can view their own travel emails"
  on travel_emails for select
  using (auth.uid() = user_id);

create policy "Users can manage their own travel emails"
  on travel_emails for all
  using (auth.uid() = user_id);

-- Add indexes for better query performance
create index travel_documents_user_id_idx on travel_documents(user_id);
create index travel_documents_expiry_date_idx on travel_documents(expiry_date);
create index travel_tickets_user_id_idx on travel_tickets(user_id);
create index travel_tickets_booking_id_idx on travel_tickets(booking_id);
create index travel_tickets_departure_date_time_idx on travel_tickets(departure_date_time);
create index email_integrations_user_id_idx on email_integrations(user_id);
create index travel_emails_user_id_idx on travel_emails(user_id);
create index travel_emails_received_date_idx on travel_emails(received_date);

-- Add triggers for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_travel_documents_updated_at
  before update on travel_documents
  for each row
  execute procedure update_updated_at_column();

create trigger update_travel_tickets_updated_at
  before update on travel_tickets
  for each row
  execute procedure update_updated_at_column();

create trigger update_email_integrations_updated_at
  before update on email_integrations
  for each row
  execute procedure update_updated_at_column();

create trigger update_travel_emails_updated_at
  before update on travel_emails
  for each row
  execute procedure update_updated_at_column();
