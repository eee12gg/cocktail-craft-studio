import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 transition-colors ${
            star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"
          } ${interactive ? "cursor-pointer hover:text-primary" : ""}`}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  );
}

export default function ReviewSection({ recipeSlug }: { recipeSlug: string }) {
  const storageKey = `reviews-${recipeSlug}`;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setReviews(JSON.parse(saved));
    } catch {}
  }, [storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || rating === 0) return;

    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim().slice(0, 100),
      rating,
      text: text.trim().slice(0, 1000),
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setName("");
    setText("");
    setRating(0);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Reviews</h2>

      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-border/50 bg-gradient-card p-5 space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full rounded-lg border border-border/50 bg-secondary px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <textarea
          placeholder="Write your review..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          rows={3}
          className="w-full rounded-lg border border-border/50 bg-secondary px-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-body text-sm text-muted-foreground">Rating:</span>
            <StarRating rating={rating} onRate={setRating} interactive />
          </div>
          <button
            type="submit"
            disabled={!name.trim() || !text.trim() || rating === 0}
            className="rounded-lg bg-primary px-5 py-2 font-body text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Review List */}
      {reviews.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-border/50 bg-gradient-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-semibold text-foreground">{review.name}</span>
                <span className="font-body text-xs text-muted-foreground">{review.date}</span>
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
