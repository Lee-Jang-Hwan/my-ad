-- =====================================================
-- Create Payments Table
-- =====================================================
-- Created: 2025-11-27
-- Description: Creates payments table for TossPayments integration
--              Stores payment records and transaction history
-- =====================================================

-- =====================================================
-- 1. Create payments table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    pricing_tier_id UUID,

    -- TossPayments payment information
    order_id TEXT NOT NULL UNIQUE,
    payment_key TEXT UNIQUE,
    amount INTEGER NOT NULL,

    -- Payment status
    status TEXT DEFAULT 'pending' NOT NULL,

    -- Payment method information
    method TEXT,
    card_company TEXT,
    card_number TEXT,

    -- Credit information
    credits_granted INTEGER NOT NULL DEFAULT 0,

    -- Error information
    failure_code TEXT,
    failure_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. Add foreign key constraints
-- =====================================================
ALTER TABLE public.payments
ADD CONSTRAINT payments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users(clerk_id)
    ON DELETE CASCADE;

ALTER TABLE public.payments
ADD CONSTRAINT payments_pricing_tier_id_fkey
    FOREIGN KEY (pricing_tier_id)
    REFERENCES public.pricing_tiers(id)
    ON DELETE SET NULL;

-- =====================================================
-- 3. Add check constraints
-- =====================================================
ALTER TABLE public.payments
ADD CONSTRAINT payments_amount_check CHECK (amount > 0),
ADD CONSTRAINT payments_status_check CHECK (status IN (
    'pending',
    'ready',
    'in_progress',
    'done',
    'canceled',
    'partial_canceled',
    'aborted',
    'expired'
)),
ADD CONSTRAINT payments_credits_granted_check CHECK (credits_granted >= 0);

-- =====================================================
-- 4. Add indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_key ON public.payments(payment_key);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_pricing_tier_id ON public.payments(pricing_tier_id);

-- =====================================================
-- 5. Enable RLS
-- =====================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. Create RLS policies
-- =====================================================
-- Users can view their own payments
CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT
TO authenticated
USING (user_id = auth.jwt()->>'sub');

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role has full access to payments"
ON public.payments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 7. Grant permissions
-- =====================================================
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- =====================================================
-- 8. Add comments
-- =====================================================
COMMENT ON TABLE public.payments IS 'Payment records for TossPayments transactions';
COMMENT ON COLUMN public.payments.user_id IS 'Clerk user ID who made the payment';
COMMENT ON COLUMN public.payments.pricing_tier_id IS 'Reference to the pricing tier purchased';
COMMENT ON COLUMN public.payments.order_id IS 'Unique order ID for TossPayments';
COMMENT ON COLUMN public.payments.payment_key IS 'TossPayments payment key returned after approval';
COMMENT ON COLUMN public.payments.amount IS 'Payment amount in KRW';
COMMENT ON COLUMN public.payments.status IS 'Payment status: pending, ready, in_progress, done, canceled, partial_canceled, aborted, expired';
COMMENT ON COLUMN public.payments.method IS 'Payment method (card, bank, etc.)';
COMMENT ON COLUMN public.payments.card_company IS 'Card company name if paid by card';
COMMENT ON COLUMN public.payments.card_number IS 'Masked card number if paid by card';
COMMENT ON COLUMN public.payments.credits_granted IS 'Number of credits granted for this payment';
COMMENT ON COLUMN public.payments.failure_code IS 'Error code if payment failed';
COMMENT ON COLUMN public.payments.failure_message IS 'Error message if payment failed';
COMMENT ON COLUMN public.payments.approved_at IS 'Timestamp when payment was approved';
COMMENT ON COLUMN public.payments.canceled_at IS 'Timestamp when payment was canceled';

-- =====================================================
-- 9. Verify the setup
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Payments table setup complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Table: public.payments';
    RAISE NOTICE 'RLS: Enabled';
    RAISE NOTICE 'Policies: Users can view own payments';
    RAISE NOTICE '============================================';
END $$;
