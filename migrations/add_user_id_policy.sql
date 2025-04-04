-- Add policies for users accessing through API keys
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own data through API key"
  ON orders FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM api_keys 
      WHERE is_active = true 
      AND expires_at > NOW()
    )
  );

CREATE POLICY "Users can access their own data through API key"
  ON payments FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM api_keys 
      WHERE is_active = true 
      AND expires_at > NOW()
    )
  );
