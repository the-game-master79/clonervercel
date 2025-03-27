-- Update transactions to mark them as expired if they are not completed within 10 minutes of creation
UPDATE transactions_history
SET status = 'EXPIRED'
WHERE status = 'PENDING' AND created_at <= NOW() - INTERVAL '10 minutes';
