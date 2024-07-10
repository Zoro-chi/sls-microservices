ALTER TABLE users
ADD COLUMN stripe_id varchar(225),
ADD COLUMN flutterwave_id varchar(225),
ADD COLUMN payment_id varchar(255);