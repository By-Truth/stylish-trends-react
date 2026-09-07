-- ============================================================
-- STYLISH TRENDS — Additive schema for admin-extra.php
-- This does NOT modify any table from the original schema.sql.
-- Run this once, in addition to schema.sql, on any server that
-- wants the extended admin endpoints (categories/coupons CRUD,
-- customers, reviews moderation, settings, media).
-- ============================================================

USE stylish_trends;

CREATE TABLE IF NOT EXISTS settings (
  `key`        VARCHAR(80) PRIMARY KEY,
  `value`      TEXT,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT IGNORE INTO settings (`key`, `value`) VALUES
  ('general', '{"store_name":"Stylish Trends","store_email":"hello@stylishtrends.ng","store_phone":"+234 800 000 0000","currency":"NGN","address":"Lagos & Port Harcourt, Nigeria"}'),
  ('shipping', '{"free_shipping_threshold":50000,"default_fee":2500,"zones":[{"name":"Lagos","fee":1500,"days":"1-2"},{"name":"South-West","fee":2500,"days":"2-4"},{"name":"Other States","fee":3500,"days":"3-7"}]}'),
  ('whatsapp', '{"number":"2348000000000","order_notifications_enabled":true,"greeting":"Hi! I would like to place an order."}'),
  ('payments', '{"paystack_enabled":true,"bank_transfer_enabled":true,"whatsapp_pay_enabled":true,"bank_name":"GTBank (Guaranty Trust Bank)","account_name":"Stylish Trends Nigeria Ltd","account_number":"0123456789"}');
