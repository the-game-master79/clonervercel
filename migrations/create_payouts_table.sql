-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_number VARCHAR(12) NOT NULL,
  utr_number VARCHAR(12),
  recipient_name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(255) NOT NULL,
  ifsc_code VARCHAR(11) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  user_id UUID NOT NULL REFERENCES auth.users(id),
  description TEXT,
  CONSTRAINT valid_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  CONSTRAINT valid_ifsc CHECK (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$')
);

-- Add indexes for common queries
CREATE INDEX payouts_user_id_idx ON payouts(user_id);
CREATE INDEX payouts_order_number_idx ON payouts(order_number);
CREATE INDEX payouts_status_idx ON payouts(status);
CREATE INDEX payouts_created_at_idx ON payouts(created_at);

-- Add RLS policies
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payouts"
  ON payouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payouts"
  ON payouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
