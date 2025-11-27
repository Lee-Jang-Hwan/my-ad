-- =====================================================
-- Add Credits and Role to Users Table
-- =====================================================
-- Created: 2025-11-27
-- Description: Adds credit_balance and role fields to users table
--              for payment system and admin functionality
-- =====================================================

-- =====================================================
-- 1. Add new columns to users table
-- =====================================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' NOT NULL;

-- =====================================================
-- 2. Add constraints
-- =====================================================
DO $$
BEGIN
    -- Add check constraint for credit_balance (must be >= 0)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_credit_balance_check'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_credit_balance_check CHECK (credit_balance >= 0);
    END IF;

    -- Add check constraint for role (must be 'user' or 'admin')
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE public.users
        ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- =====================================================
-- 3. Add indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_credit_balance ON public.users(credit_balance);

-- =====================================================
-- 4. Add comments
-- =====================================================
COMMENT ON COLUMN public.users.credit_balance IS 'User credit balance for video generation';
COMMENT ON COLUMN public.users.role IS 'User role: user or admin';

-- =====================================================
-- 5. Verify the update
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name IN ('credit_balance', 'role');

    RAISE NOTICE '============================================';
    RAISE NOTICE 'Users table update complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'New columns added: %', v_count;
    RAISE NOTICE '============================================';
END $$;
