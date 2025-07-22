-- Run this in Supabase SQL Editor to resend the email for the last order
select
  net.http_post(
    url := 'https://ngxvbmxhziirnxkycodx.supabase.co/functions/v1/send-order-email',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"sessionId": "cs_test_b1BP1GtdA38PGJwExqmvSWZDxxe2CiBQctV8k9XHozhfmlQsZ9t6xU6vZG"}'::jsonb
  ) as request_id;