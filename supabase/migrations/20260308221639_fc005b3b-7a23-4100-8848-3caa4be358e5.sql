CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages FOR INSERT
WITH CHECK (
  length(name) > 0 AND length(name) <= 100
  AND length(email) > 0 AND length(email) <= 255
  AND length(message) > 0 AND length(message) <= 2000
);

-- Only admins can view/manage messages
CREATE POLICY "Admins can manage contact messages"
ON public.contact_messages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));