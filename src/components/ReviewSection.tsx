import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 transition-colors ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"} ${interactive ? "cursor-pointer hover:text-primary" : ""}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

export default function ReviewSection({ recipeId, recipeSlug }: { recipeId: string; recipeSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const { t, lang } = useLanguage();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, author_name, rating, text, created_at")
        .eq("recipe_id", recipeId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      if (data) setReviews(data);
    };
    fetchReviews();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || rating === 0 || rateLimited) return;

    if (submitCount >= 2) {
      setRateLimited(true);
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.from("reviews").insert({
      recipe_id: recipeId,
      author_name: name.trim().slice(0, 100),
      rating,
      text: text.trim().slice(0, 1000),
    }).select().single();

    if (error) {
      if (error.code === "42501" || error.message?.includes("policy")) {
        setRateLimited(true);
      }
      setSubmitting(false);
      return;
    }

    if (data) {
      setReviews([data, ...reviews]);
      setName("");
      setText("");
      setRating(0);
      setSubmitCount((c) => c + 1);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">{t("recipe.reviews", "Reviews")}</h2>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border/50 bg-gradient-card p-5 space-y-4">
        <input type="text" placeholder={t("review.your_name", "Your name")} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="w-full rounded-lg border border-border/50 bg-secondary px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        <textarea placeholder={t("review.write", "Write your review...")} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={3} className="w-full rounded-lg border border-border/50 bg-secondary px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-muted-foreground">{t("review.rating", "Rating:")}</span>
            <StarRating rating={rating} onRate={setRating} interactive />
          </div>
          <button type="submit" disabled={!name.trim() || !text.trim() || rating === 0 || submitting || rateLimited} className="rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
            {rateLimited ? t("review.rate_limited", "Too many reviews") : submitting ? t("review.sending", "Sending...") : t("review.submit", "Submit")}
          </button>
        </div>
      </form>

      {reviews.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">{t("review.empty", "No reviews yet. Be the first!")}</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border/50 bg-gradient-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-semibold text-foreground">{review.author_name}</span>
                <span className="font-body text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString(lang === "uk" ? "uk-UA" : lang === "de" ? "de-DE" : lang === "fr" ? "fr-FR" : lang === "pl" ? "pl-PL" : "en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              <StarRating rating={review.rating} />
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
