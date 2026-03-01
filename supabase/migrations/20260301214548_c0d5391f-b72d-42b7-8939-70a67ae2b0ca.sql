
-- Fix: restrict login_attempts insert to be more specific
DROP POLICY "Anyone can insert login attempts" ON public.login_attempts;

-- Allow insert via service role or edge function only (no anon insert)
-- We'll handle login attempt tracking via edge function with service role
CREATE POLICY "Service role can insert login attempts"
  ON public.login_attempts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
