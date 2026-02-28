import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-border/50 bg-gradient-card">
      {/* Neon glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl font-bold tracking-wide text-gradient-gold">
            COCKTAIL CRAFT
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-6">
            <Link to="/cocktails" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              Cocktails
            </Link>
            <Link to="/shots" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              Shots
            </Link>
            <Link to="/non-alcoholic" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              Non-Alcoholic
            </Link>
            <Link to="/search" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
              Search
            </Link>
          </nav>

          {/* Contact */}
          <div className="text-center md:text-right">
            <p className="font-body text-sm text-muted-foreground">
              Contact us at{" "}
              <a href="mailto:hello@cocktailcraft.com" className="text-primary hover:underline">
                hello@cocktailcraft.com
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-border/30 pt-6">
          <span className="font-body text-xs text-muted-foreground">
            © {currentYear} Cocktail Craft. All rights reserved.
          </span>
        </div>
      </div>

      {/* Subtle neon ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
    </footer>
  );
}
