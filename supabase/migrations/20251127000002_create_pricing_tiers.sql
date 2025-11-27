-- =====================================================
-- Create Pricing Tiers Table
-- =====================================================
-- Created: 2025-11-27
-- Description: Creates pricing_tiers table for credit packages
--              with initial pricing data
-- =====================================================

-- =====================================================
-- 1. Create pricing_tiers table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    original_price INTEGER NOT NULL,
    sale_price INTEGER NOT NULL,
    credits INTEGER NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =====================================================
-- 2. Add constraints
-- =====================================================
ALTER TABLE public.pricing_tiers
ADD CONSTRAINT pricing_tiers_original_price_check CHECK (original_price > 0),
ADD CONSTRAINT pricing_tiers_sale_price_check CHECK (sale_price > 0),
ADD CONSTRAINT pricing_tiers_credits_check CHECK (credits > 0);

-- =====================================================
-- 3. Add indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_is_active ON public.pricing_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_sort_order ON public.pricing_tiers(sort_order);

-- =====================================================
-- 4. Enable RLS
-- =====================================================
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Create RLS policies
-- =====================================================
-- Anyone can view active pricing tiers (public data)
CREATE POLICY "Anyone can view active pricing tiers"
ON public.pricing_tiers FOR SELECT
USING (is_active = true);

-- =====================================================
-- 6. Grant permissions
-- =====================================================
GRANT SELECT ON public.pricing_tiers TO anon;
GRANT SELECT ON public.pricing_tiers TO authenticated;
GRANT ALL ON public.pricing_tiers TO service_role;

-- =====================================================
-- 7. Add comments
-- =====================================================
COMMENT ON TABLE public.pricing_tiers IS 'Pricing tiers for credit packages';
COMMENT ON COLUMN public.pricing_tiers.name IS 'Internal name for the tier (unique identifier)';
COMMENT ON COLUMN public.pricing_tiers.display_name IS 'Display name shown to users';
COMMENT ON COLUMN public.pricing_tiers.original_price IS 'Original price in KRW';
COMMENT ON COLUMN public.pricing_tiers.sale_price IS 'Discounted sale price in KRW';
COMMENT ON COLUMN public.pricing_tiers.credits IS 'Number of credits included';
COMMENT ON COLUMN public.pricing_tiers.is_popular IS 'Whether to show HOT badge';
COMMENT ON COLUMN public.pricing_tiers.sort_order IS 'Display order (ascending)';
COMMENT ON COLUMN public.pricing_tiers.is_active IS 'Whether this tier is available for purchase';

-- =====================================================
-- 8. Insert initial pricing data
-- =====================================================
INSERT INTO public.pricing_tiers (name, display_name, original_price, sale_price, credits, is_popular, sort_order)
VALUES
    ('single', 'Single', 19900, 17900, 100, false, 1),
    ('business_5', 'Business 5-pack', 88000, 75500, 500, true, 2),
    ('business_10', 'Business 10-pack', 179000, 153000, 1000, false, 3)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    original_price = EXCLUDED.original_price,
    sale_price = EXCLUDED.sale_price,
    credits = EXCLUDED.credits,
    is_popular = EXCLUDED.is_popular,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

-- =====================================================
-- 9. Create updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_pricing_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pricing_tiers_updated_at ON public.pricing_tiers;
CREATE TRIGGER trigger_pricing_tiers_updated_at
    BEFORE UPDATE ON public.pricing_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_tiers_updated_at();

-- =====================================================
-- 10. Verify the setup
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.pricing_tiers;

    RAISE NOTICE '============================================';
    RAISE NOTICE 'Pricing tiers table setup complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Total pricing tiers: %', v_count;
    RAISE NOTICE '============================================';
END $$;
