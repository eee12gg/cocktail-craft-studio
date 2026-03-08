
-- Rate limiting function for contact messages (max 3 per hour per IP-like fingerprint based on email)
CREATE OR REPLACE FUNCTION public.is_contact_rate_limited(_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.contact_messages
    WHERE email = _email
      AND created_at > now() - interval '1 hour'
  ) >= 3
$$;

-- Rate limiting function for reviews (max 5 per hour per author name + recipe combo)
CREATE OR REPLACE FUNCTION public.is_review_rate_limited(_author_name text, _recipe_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.reviews
    WHERE author_name = _author_name
      AND recipe_id = _recipe_id
      AND created_at > now() - interval '1 hour'
  ) >= 2
$$;

-- Update contact_messages insert policy to include rate limiting
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  (length(name) > 0) AND (length(name) <= 100)
  AND (length(email) > 0) AND (length(email) <= 255)
  AND (length(message) > 0) AND (length(message) <= 2000)
  AND NOT public.is_contact_rate_limited(email)
);

-- Update reviews insert policy to include rate limiting
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews"
ON public.reviews
FOR INSERT
WITH CHECK (
  (length(author_name) > 0) AND (length(author_name) <= 100)
  AND (length(text) > 0) AND (length(text) <= 1000)
  AND (rating >= 1) AND (rating <= 5)
  AND NOT public.is_review_rate_limited(author_name, recipe_id)
);
