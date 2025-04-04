-- Add expires_at column with default 7 minutes from creation
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 minutes');

-- Create function to automatically fail expired orders
CREATE OR REPLACE FUNCTION fail_expired_orders()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update orders that have expired and are still pending
  UPDATE orders 
  SET status = 'FAILED'
  WHERE expires_at < NOW() 
  AND status = 'PENDING';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run every minute
CREATE OR REPLACE TRIGGER check_expired_orders
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION fail_expired_orders();
