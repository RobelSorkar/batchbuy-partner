
UPDATE wallets SET balance = balance + 100000 WHERE user_id = 'e10fc0bb-3d9d-4ecc-bbdc-3d4a95af3a4d';

INSERT INTO transactions (user_id, type, amount, description, status)
VALUES ('e10fc0bb-3d9d-4ecc-bbdc-3d4a95af3a4d', 'profit', 100000, 'Test credit — manual deposit for testing', 'completed');
