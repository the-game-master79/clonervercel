-- First rename the existing utr_number column in payments to order_number
ALTER TABLE payments 
RENAME COLUMN utr_number TO order_number;

-- Add new utr_number column to payments
ALTER TABLE payments
ADD COLUMN utr_number VARCHAR(12);

-- Add utr_number column to orders if not exists
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS utr_number VARCHAR(12);

-- Update the trigger to handle both fields
CREATE OR REPLACE FUNCTION fail_expired_orders()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders 
  SET status = 'FAILED'
  WHERE expires_at < NOW() 
  AND status = 'PENDING';
  
  UPDATE payments
  SET status = 'FAILED'
  WHERE order_number IN (
    SELECT order_number 
    FROM orders 
    WHERE expires_at < NOW() 
    AND status = 'FAILED'
  )
  AND status = 'PENDING';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
