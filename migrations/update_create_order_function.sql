CREATE OR REPLACE FUNCTION create_order(amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_number text;
  v_order_id uuid;
  v_payment_id uuid;
  v_order record;
  v_payment record;
  v_user_id uuid;
BEGIN
  -- Get the user_id associated with the API key
  SELECT auth.uid() INTO v_user_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Generate order number
  v_order_number := substring(md5(random()::text), 0, 9);
  
  -- Create order
  INSERT INTO orders (
    order_number,
    amount,
    status,
    user_id,
    expires_at
  ) VALUES (
    v_order_number,
    amount,
    'PENDING',
    v_user_id,
    NOW() + interval '7 minutes'
  )
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
    v_order_number,
    amount,
    'PENDING',
    'UPI',
    v_user_id,
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
