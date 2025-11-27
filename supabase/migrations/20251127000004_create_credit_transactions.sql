-- =====================================================
-- Create Credit Transactions Table
-- =====================================================
-- Created: 2025-11-27
-- Description: Creates credit_transactions table for tracking
--              all credit balance changes (purchases, usage, grants, refunds)
-- =====================================================

-- =====================================================
-- 1. Create credit_transactions table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,

    -- Transaction type and amount
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,

    -- Related records
    payment_id UUID,
    ad_video_id UUID,
    granted_by TEXT,

    -- Description
    description TEXT,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =====================================================
-- 2. Add foreign key constraints
-- =====================================================
ALTER TABLE public.credit_transactions
ADD CONSTRAINT credit_transactions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(clerk_id)
    ON DELETE CASCADE;

ALTER TABLE public.credit_transactions
ADD CONSTRAINT credit_transactions_payment_id_fkey
    FOREIGN KEY (payment_id)
    REFERENCES public.payments(id)
    ON DELETE SET NULL;

ALTER TABLE public.credit_transactions
ADD CONSTRAINT credit_transactions_ad_video_id_fkey
    FOREIGN KEY (ad_video_id)
    REFERENCES public.ad_videos(id)
    ON DELETE SET NULL;

ALTER TABLE public.credit_transactions
ADD CONSTRAINT credit_transactions_granted_by_fkey
    FOREIGN KEY (granted_by)
    REFERENCES public.users(clerk_id)
    ON DELETE SET NULL;

-- =====================================================
-- 3. Add check constraints
-- =====================================================
ALTER TABLE public.credit_transactions
ADD CONSTRAINT credit_transactions_type_check CHECK (type IN (
    'purchase',
    'usage',
    'admin_grant',
    'refund',
    'expiry'
)),
ADD CONSTRAINT credit_transactions_balance_after_check CHECK (balance_after >= 0);

-- =====================================================
-- 4. Add indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_payment_id ON public.credit_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_ad_video_id ON public.credit_transactions(ad_video_id);

-- =====================================================
-- 5. Enable RLS
-- =====================================================
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. Create RLS policies
-- =====================================================
-- Users can view their own transactions
CREATE POLICY "Users can view own credit transactions"
ON public.credit_transactions FOR SELECT
TO authenticated
USING (user_id = auth.jwt()->>'sub');

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role has full access to credit transactions"
ON public.credit_transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 7. Grant permissions
-- =====================================================
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;

-- =====================================================
-- 8. Add comments
-- =====================================================
COMMENT ON TABLE public.credit_transactions IS 'Credit transaction history for users';
COMMENT ON COLUMN public.credit_transactions.user_id IS 'Clerk user ID whose credits changed';
COMMENT ON COLUMN public.credit_transactions.type IS 'Transaction type: purchase, usage, admin_grant, refund, expiry';
COMMENT ON COLUMN public.credit_transactions.amount IS 'Credit change amount (positive for add, negative for deduct)';
COMMENT ON COLUMN public.credit_transactions.balance_after IS 'Credit balance after this transaction';
COMMENT ON COLUMN public.credit_transactions.payment_id IS 'Related payment if type is purchase';
COMMENT ON COLUMN public.credit_transactions.ad_video_id IS 'Related video if type is usage';
COMMENT ON COLUMN public.credit_transactions.granted_by IS 'Admin who granted credits if type is admin_grant';
COMMENT ON COLUMN public.credit_transactions.description IS 'Optional description for the transaction';

-- =====================================================
-- 9. Verify the setup
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Credit transactions table setup complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Table: public.credit_transactions';
    RAISE NOTICE 'RLS: Enabled';
    RAISE NOTICE 'Policies: Users can view own transactions';
    RAISE NOTICE '============================================';
END $$;
