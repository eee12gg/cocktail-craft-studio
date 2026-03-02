
-- Fix overly permissive INSERT on reviews: require non-empty author and text, valid rating
DROP POLICY "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews" ON public.reviews FOR INSERT
  WITH CHECK (
    length(author_name) > 0 AND length(author_name) <= 100
    AND length(text) > 0 AND length(text) <= 1000
    AND rating >= 1 AND rating <= 5
  );
