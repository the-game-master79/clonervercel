CREATE POLICY "Allow access through JWT token"
  ON orders
  FOR ALL
  USING (
    auth.jwt()->>'sub' IN (
      SELECT user_id::text FROM api_keys 
      WHERE is_active = true 
      AND expires_at > NOW()
    )
  );

CREATE POLICY "Allow access through JWT token"
  ON payments
  FOR ALL
  USING (
    auth.jwt()->>'sub' IN (
      SELECT user_id::text FROM api_keys 
      WHERE is_active = true 
      AND expires_at > NOW()
    )
  );

-- Add policy for insert operations
CREATE POLICY "Allow insert through JWT token"
  ON orders
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'sub' IN (
      SELECT user_id::text FROM api_keys 
      WHERE is_active = true 
      AND expires_at > NOW()
    )
  );

-- Add policy for insert operations on payments
CREATE POLICY "Allow insert through JWT token"
  ON payments
  FOR INSERT
  WITH CHECK (
    auth.jwt()->>'sub' IN (
      SELECT user_id::text FROM api_keys 
      WHERE is_active = true 
      AND expires_at > NOW()
    )
  );

-- Add bypass policy for service role
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access"
  ON orders
  FOR ALL
  USING (current_user = 'service_role');

CREATE POLICY "Allow service role full access"
  ON payments
  FOR ALL
  USING (current_user = 'service_role');
