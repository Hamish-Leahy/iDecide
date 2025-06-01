-- Create email integration tables and policies
create table public.email_integrations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null check (provider in ('gmail', 'outlook', 'other')),
  email text not null,
  is_connected boolean default false,
  last_synced timestamp with time zone,
  tokens jsonb,
  filters jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.email_integrations enable row level security;

-- Policies
create policy "Users can view their own email integrations"
  on public.email_integrations
  for select using (auth.uid() = user_id);

create policy "Users can insert their own email integrations"
  on public.email_integrations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own email integrations"
  on public.email_integrations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own email integrations"
  on public.email_integrations
  for delete using (auth.uid() = user_id);

-- Indexes
create index email_integrations_user_id_idx on public.email_integrations(user_id);
create index email_integrations_provider_idx on public.email_integrations(provider);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for updated_at
create trigger handle_email_integrations_updated_at
  before update on public.email_integrations
  for each row
  execute procedure public.handle_updated_at();

-- Add encryption for sensitive data
create extension if not exists "pgsodium";

-- Create a separate table for encrypted tokens
create table public.email_integration_tokens (
  id uuid primary key references public.email_integrations(id) on delete cascade,
  encrypted_tokens bytea,
  nonce bytea
);

-- Function to safely store encrypted tokens
create or replace function public.store_encrypted_tokens(
  p_integration_id uuid,
  p_tokens jsonb
)
returns void as $$
declare
  v_key bytea;
  v_nonce bytea;
  v_encrypted bytea;
begin
  -- Generate a new nonce for each encryption
  v_nonce := pgsodium.crypto_secretbox_noncegen();
  
  -- Encrypt the tokens
  v_encrypted := pgsodium.crypto_secretbox(
    convert_to(p_tokens::text, 'utf8'),
    v_nonce,
    current_setting('app.settings.jwt_secret')::bytea
  );

  -- Store the encrypted data
  insert into public.email_integration_tokens (id, encrypted_tokens, nonce)
  values (p_integration_id, v_encrypted, v_nonce)
  on conflict (id) do update
    set encrypted_tokens = excluded.encrypted_tokens,
        nonce = excluded.nonce;
end;
$$ language plpgsql security definer;
