-- 1. Ensure the user exists in the public.users table (trigger might have failed)
-- Replace 'admin@ottoman.com' with the email you are using if different.
-- This works by checking if the user exists in auth.users and inserting/updating public.users

INSERT INTO public.users (id, email, username, is_admin, subscription_status)
SELECT 
  id, 
  email, 
  'admin', -- default username
  true,    -- make admin
  'premium' -- make premium
FROM auth.users
WHERE email = 'admin@ottoman.com'
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  subscription_status = 'premium';

-- 2. Verify settings
SELECT * FROM public.users WHERE email = 'admin@ottoman.com';
