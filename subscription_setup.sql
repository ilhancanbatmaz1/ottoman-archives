-- Add Premium Flag to Documents
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add Subscription Fields to Users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free', -- 'free' | 'premium'
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- RLS: Everyone can read 'is_premium' flag (so we can show locks)
-- (Existing SELECT policy for public usually covers all columns, verifying...)

-- NOTE: Access control will be enforced in:
-- 1. App Logic (Redirecting users)
-- 2. RLS (Preventing fetching of token details if premium & user not premium - Optional for V2)
