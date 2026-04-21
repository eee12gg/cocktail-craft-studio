import { useState } from "react";
import { Mail, Send, CheckCircle2, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SeoHead from "@/components/SeoHead";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
});

export default function ContactsPage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        const f = i.path[0] as string;
        if (!fieldErrors[f]) fieldErrors[f] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
    });
    setSending(false);
    if (error) {
      toast.error(t("contact.error", "Error sending message. Please try again."));
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <SeoHead
        path="/contacts"
        title={`${t("contact.title", "Contact Us")} — Cocktail Craft`}
        description={t("contact.subtitle", "Get in touch with the Cocktail Craft team.")}
      />
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            {t("contact.title", "Contact Us")}
          </h1>
          <p className="mt-3 font-body text-lg text-muted-foreground">
            {t("contact.subtitle", "We'd love to hear from you.")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-gradient-card p-5">
              <Mail className="mb-2 h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Email</h3>
              <a
                href="mailto:hello@cocktailcraft.com"
                className="mt-1 block text-sm text-primary hover:underline"
              >
                hello@cocktailcraft.com
              </a>
            </div>
            <div className="rounded-xl border border-border/50 bg-gradient-card p-5">
              <Clock className="mb-2 h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">
                {t("contact.hours", "Response time")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("contact.hours_value", "Within 24 hours")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-gradient-card p-6">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <CheckCircle2 className="h-14 w-14 text-primary" />
                <p className="font-display text-xl font-semibold text-foreground">
                  {t("contact.sent_title", "Message sent!")}
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  {t("contact.sent_desc", "We'll reply to your email shortly.")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cn">{t("contact.name", "Name")}</Label>
                  <Input
                    id="cn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ce">Email</Label>
                  <Input
                    id="ce"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cm">{t("contact.message", "Message")}</Label>
                  <Textarea
                    id="cm"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    maxLength={2000}
                  />
                  <div className="flex justify-between text-xs">
                    {errors.message ? (
                      <span className="text-destructive">{errors.message}</span>
                    ) : (
                      <span />
                    )}
                    <span className="text-muted-foreground">{message.length}/2000</span>
                  </div>
                </div>
                <Button type="submit" disabled={sending} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  {sending
                    ? t("contact.sending", "Sending...")
                    : t("contact.send", "Send")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
