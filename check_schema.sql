-- Check actual columns in product_images table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'product_images'
ORDER BY 
    ordinal_position;
