-- First drop existing functions and triggers
DROP TRIGGER IF EXISTS ensure_order_fields_trigger ON orders;
DROP FUNCTION IF EXISTS ensure_order_fields();
DROP FUNCTION IF EXISTS get_default_user_id();
DROP FUNCTION IF EXISTS create_order(numeric);

-- Add column defaults
ALTER TABLE orders 
  ALTER COLUMN user_id SET DEFAULT '4f659eca-ae95-4bb9-8c38-452ce614d422',
  ALTER COLUMN order_number SET DEFAULT substr(md5(random()::text), 0, 9),
  ALTER COLUMN upi_id SET DEFAULT 'vermils@ybl',
  ALTER COLUMN status SET DEFAULT 'PENDING',
  ALTER COLUMN expires_at SET DEFAULT NOW() + interval '7 minutes';

-- Create trigger function for order fields
CREATE OR REPLACE FUNCTION ensure_order_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Set static user_id if not provided
  IF NEW.user_id IS NULL THEN
    NEW.user_id := '4f659eca-ae95-4bb9-8c38-452ce614d422'::uuid;
  END IF;

  -- Generate order number if not provided
  IF NEW.order_number IS NULL THEN
    NEW.order_number := substr(md5(random()::text), 0, 9);
  END IF;

  -- Set default UPI ID if not provided
  IF NEW.upi_id IS NULL THEN
    NEW.upi_id := 'vermils@ybl';
  END IF;

  -- Set default status if not provided  
  IF NEW.status IS NULL THEN
    NEW.status := 'PENDING';
  END IF;

  -- Set expiry time if not provided
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NOW() + interval '7 minutes';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert
CREATE TRIGGER ensure_order_fields_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION ensure_order_fields();

-- Simplified create_order function using defaults
CREATE OR REPLACE FUNCTION create_order(amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_payment record;
BEGIN
  -- Create order (trigger will handle defaults)
  INSERT INTO orders (amount)
  VALUES (amount)
  RETURNING * INTO v_order;

  -- Create associated payment
  INSERT INTO payments (
    order_number,
    amount,
    status,
    method,
    user_id,
    recipient_name
  ) VALUES (
    v_order.order_number,
    amount,
    'PENDING',
    'UPI',
    v_order.user_id,
    'Customer Payment'
  )
  RETURNING * INTO v_payment;

  -- Return both order and payment details
  RETURN json_build_object(
    'order', v_order,
    'payment', v_payment
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_order(numeric) TO authenticated;

-- Update existing records to use default user_id
UPDATE orders SET user_id = '4f659eca-ae95-4bb9-8c38-452ce614d422'::uuid 
WHERE user_id IS NULL;

UPDATE payments SET user_id = '4f659eca-ae95-4bb9-8c38-452ce614d422'::uuid 
WHERE user_id IS NULL;
