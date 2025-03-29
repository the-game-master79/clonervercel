CREATE OR REPLACE FUNCTION automatically_expire_transactions() 
RETURNS trigger AS $$
BEGIN
  -- Only update if the status hasn't already been changed in this transaction
  IF TG_OP = 'INSERT' OR OLD.status <> NEW.status THEN
    UPDATE transactions_history
    SET status = 'EXPIRED'
    WHERE status = 'PENDING'
      AND expires_at < NOW()
      AND transaction_id <> NEW.transaction_id;  -- Avoid updating the current record
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs only on INSERT
CREATE OR REPLACE TRIGGER expire_transactions_trigger
  AFTER INSERT ON transactions_history
  FOR EACH ROW
  EXECUTE FUNCTION automatically_expire_transactions();
