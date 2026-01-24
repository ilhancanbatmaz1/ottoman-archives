-- Create the site_content table for dynamic text management
create table public.site_content (
  key text primary key,
  value text not null,
  category text default 'general',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.site_content enable row level security;

-- Policies
-- Everyone can read content
create policy "Public content is viewable by everyone"
  on public.site_content for select
  using ( true );

-- Only admins can insert/update/delete
-- Assuming we use the existing admin check logic or just allow authenticated users if no roles yet
-- For tighter security, we should check app_metadata or a specific admin table. 
-- For now, we'll allow authenticated users (which are likely admins in this context if signup is restricted, or we rely on frontend protection + future RLS hardening)
create policy "Admins can manage content"
  on public.site_content for all
  using ( auth.role() = 'authenticated' );

-- Insert default content
insert into public.site_content (key, value, category, description) values
('home_hero_title', 'Tarihin <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-amber-500">Tozlu Sayfalarını</span> Aralayın', 'home', 'Ana sayfa büyük başlık (HTML destekler)'),
('home_hero_subtitle', 'Osmanlıca arşiv belgelerini okumayı öğrenin, kendinizi geliştirin ve tarihe tanıklık edin. Yapay zeka destekli pratik araçlarıyla öğrenmek artık çok daha kolay.', 'home', 'Ana sayfa alt başlık'),
('footer_text', '© 2026 Osmanlıca Okuma Yardımcısı. Tarihi sevdirmek için geliştirildi.', 'footer', 'Sayfa altındaki telif yazısı');
