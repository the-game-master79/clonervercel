-- Add policies to allow access through API keys
CREATE POLICY "Allow access through valid API key"
  ON orders
  FOR ALL  -- This allows all operations (SELECT, INSERT, UPDATE, DELETE)
  USING (
    EXISTS (
      SELECT 1 FROM api_keys
      WHERE api_keys.user_id = auth.uid()
      AND api_keys.is_active = true
      AND api_keys.expires_at > NOW()
    )
  );

CREATE POLICY "Allow access through valid API key"
  ON payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM api_keys
      WHERE api_keys.user_id = auth.uid()
      AND api_keys.is_active = true
      AND api_keys.expires_at > NOW()
    )
  );
