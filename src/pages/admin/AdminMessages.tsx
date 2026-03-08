import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Mail,
  MailOpen,
  Trash2,
  Eye,
  CheckCheck,
  Inbox,
} from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [viewMsg, setViewMsg] = useState<ContactMessage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ContactMessage[];
    },
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.is_read) return false;
    if (filter === "read" && !m.is_read) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
  }, [queryClient]);

  const handleView = useCallback(async (msg: ContactMessage) => {
    setViewMsg(msg);
    if (!msg.is_read) {
      await markAsRead(msg.id);
    }
  }, [markAsRead]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else toast.success("Сообщение удалено");
    setDeleteConfirm(null);
    setViewMsg(null);
    queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
  }, [queryClient]);

  const handleBulkRead = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => supabase.from("contact_messages").update({ is_read: true }).eq("id", id)));
    setSelectedIds(new Set());
    toast.success(`${ids.length} отмечено как прочитанные`);
    queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
  }, [selectedIds, queryClient]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map((id) => supabase.from("contact_messages").delete().eq("id", id)));
    setSelectedIds(new Set());
    toast.success(`${ids.length} сообщений удалено`);
    queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
  }, [selectedIds, queryClient]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.id)));
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-foreground">Сообщения</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">{unreadCount} новых</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">Всего</span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{messages.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">Непрочитанных</span>
          <p className="mt-1 font-display text-2xl font-bold text-primary">{unreadCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">Прочитанных</span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{messages.length - unreadCount}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {f === "all" ? "Все" : f === "unread" ? "Непрочитанные" : "Прочитанные"}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <span className="text-sm font-medium text-foreground">Выбрано: {selectedIds.size}</span>
          <Button variant="outline" size="sm" onClick={handleBulkRead}>
            <CheckCheck className="h-3.5 w-3.5 mr-1" /> Прочитано
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Удалить
          </Button>
        </div>
      )}

      {/* Messages list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Inbox className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{search || filter !== "all" ? "Ничего не найдено" : "Нет сообщений"}</p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-1.5">
            <input
              type="checkbox"
              checked={selectedIds.size === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-xs text-muted-foreground">Выбрать все</span>
          </div>
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:border-primary/30 ${
                msg.is_read ? "border-border bg-card" : "border-primary/20 bg-primary/5"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(msg.id)}
                onChange={() => toggleSelect(msg.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 h-4 w-4 rounded border-border flex-shrink-0"
              />
              <div className="flex-shrink-0 mt-0.5">
                {msg.is_read ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0" onClick={() => handleView(msg)}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm truncate ${msg.is_read ? "text-foreground" : "font-semibold text-foreground"}`}>
                    {msg.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">&lt;{msg.email}&gt;</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.message}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(msg.created_at)}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleView(msg)}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(msg.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View dialog */}
      <Dialog open={!!viewMsg} onOpenChange={(v) => !v && setViewMsg(null)}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-lg text-foreground">
              <Mail className="h-5 w-5 text-primary" />
              Сообщение
            </DialogTitle>
          </DialogHeader>
          {viewMsg && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Имя</p>
                  <p className="text-sm font-medium text-foreground">{viewMsg.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${viewMsg.email}`} className="text-sm font-medium text-primary hover:underline">
                    {viewMsg.email}
                  </a>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Дата</p>
                  <p className="text-sm text-foreground">{formatDate(viewMsg.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Сообщение</p>
                <div className="rounded-lg bg-secondary p-4 text-sm text-foreground whitespace-pre-wrap break-words">
                  {viewMsg.message}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" asChild>
                  <a href={`mailto:${viewMsg.email}?subject=Re: Cocktail Craft`}>
                    <Mail className="h-4 w-4 mr-1" /> Ответить
                  </a>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { setDeleteConfirm(viewMsg.id); }}>
                  <Trash2 className="h-4 w-4 mr-1" /> Удалить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Удалить сообщение?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить.</p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Удалить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
