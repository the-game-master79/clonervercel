-- Drop the existing table
DROP TABLE IF EXISTS transactions_history;

-- Recreate the table with the updated schema
CREATE TABLE transactions_history (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'IN' or 'OUT'
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL, -- e.g., 'UPI', 'BANK', 'CRYPTO'
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED')), -- Add 'PROCESSING' status
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    utr_info TEXT -- Add column to store UTR or transaction ID
);
