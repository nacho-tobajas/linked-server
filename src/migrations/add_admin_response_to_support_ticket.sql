ALTER TABLE hd_support_ticket
  ADD COLUMN IF NOT EXISTS admin_response TEXT;

ALTER TABLE hd_support_ticket ADD COLUMN IF NOT EXISTS contact_email VARCHAR(254);
