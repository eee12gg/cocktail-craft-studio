import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useLanguage } from "@/hooks/useLanguage";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(100, "Имя слишком длинное"),
  email: z.string().trim().email("Некорректный email").max(255, "Email слишком длинный"),
  message: z.string().trim().min(1, "Введите сообщение").max(2000, "Сообщение слишком длинное (макс. 2000)"),
});

interface ContactDialogProps {
  trigger: React.ReactNode;
}

export default function ContactDialog({ trigger }: ContactDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rateLimited, setRateLimited] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const resetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
    setErrors({});
    setSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Client-side rate limit check
    if (submitCount >= 3) {
      setRateLimited(true);
      toast.error(t("contact.rate_limit", "Слишком много сообщений. Попробуйте позже."));
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
      if (error.code === "42501" || error.message?.includes("policy")) {
        setRateLimited(true);
        toast.error(t("contact.rate_limit", "Слишком много сообщений. Попробуйте позже."));
      } else {
        toast.error(t("contact.error", "Ошибка отправки. Попробуйте позже."));
      }
      return;
    }

    setSubmitCount((c) => c + 1);
    setSent(true);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setTimeout(resetForm, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl text-foreground">
            <Mail className="h-5 w-5 text-primary" />
            {t("contact.title", "Связаться с нами")}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                {t("contact.sent_title", "Сообщение отправлено!")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("contact.sent_desc", "Мы ответим на ваш email в ближайшее время.")}
              </p>
            </div>
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="mt-2">
              {t("contact.close", "Закрыть")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("contact.subtitle", "Напишите нам, и мы свяжемся с вами по email.")}
            </p>
            <p className="text-xs text-muted-foreground">
              Email:{" "}
              <a href="mailto:hello@cocktailcraft.com" className="text-primary hover:underline">
                hello@cocktailcraft.com
              </a>
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="contact-name">{t("contact.name", "Имя")}</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("contact.name_placeholder", "Ваше имя")}
                maxLength={100}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-message">{t("contact.message", "Сообщение")}</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("contact.message_placeholder", "Ваше сообщение...")}
                rows={4}
                maxLength={2000}
              />
              <div className="flex justify-between">
                {errors.message ? (
                  <p className="text-xs text-destructive">{errors.message}</p>
                ) : <span />}
                <span className="text-xs text-muted-foreground">{message.length}/2000</span>
              </div>
            </div>

            <Button type="submit" disabled={sending} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {sending ? t("contact.sending", "Отправка...") : t("contact.send", "Отправить")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
