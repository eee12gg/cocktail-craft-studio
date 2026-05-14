import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Star, Search, MessageSquare, Eye, EyeOff, Pencil, Trash2,
  ChevronDown, Filter, ArrowUpDown, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface ReviewRow {
  id: string;
  recipe_id: string;
  author_name: string;
  rating: number;
  text: string;
  is_visible: boolean;
  created_at: string;
  recipes: { title: string; slug: string } | null;
}

type SortKey = "date" | "rating" | "author" | "recipe";
type FilterStatus = "all" | "visible" | "hidden";
type FilterRating = 0 | 1 | 2 | 3 | 4 | 5;

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editReview, setEditReview] = useState<ReviewRow | null>(null);
  const [editText, setEditText] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRating, setFilterRating] = useState<FilterRating>(0);
  const [bulkAction, setBulkAction] = useState<"show" | "hide" | "delete" | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*, recipes(title, slug)")
      .order("created_at", { ascending: false });
    if (error) toast.error("Ошибка загрузки отзывов");
    else setReviews((data as ReviewRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const toggleVisibility = async (id: string, current: boolean) => {
    const { error } = await supabase.from("reviews").update({ is_visible: !current }).eq("id", id);
    if (error) toast.error("Ошибка");
    else {
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_visible: !current } : r));
      toast.success(current ? "Отзыв скрыт" : "Отзыв показан");
    }
  };

  const openEdit = (r: ReviewRow) => {
    setEditReview(r);
    setEditText(r.text);
    setEditAuthor(r.author_name);
  };

  const handleEditSave = async () => {
    if (!editReview) return;
    const { error } = await supabase.from("reviews").update({
      text: editText.trim(),
      author_name: editAuthor.trim(),
    }).eq("id", editReview.id);
    if (error) toast.error("Ошибка сохранения");
    else {
      setReviews((prev) => prev.map((r) => r.id === editReview.id ? { ...r, text: editText.trim(), author_name: editAuthor.trim() } : r));
      toast.success("Отзыв обновлён");
      setEditReview(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Отзыв удалён");
    }
    setDeleteConfirm(null);
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    if (bulkAction === "show" || bulkAction === "hide") {
      const isVisible = bulkAction === "show";
      const { error } = await supabase.from("reviews").update({ is_visible: isVisible }).in("id", ids);
      if (error) toast.error("Ошибка");
      else {
        setReviews((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, is_visible: isVisible } : r));
        toast.success(`${ids.length} отзывов ${isVisible ? "показано" : "скрыто"}`);
      }
    } else if (bulkAction === "delete") {
      const { error } = await supabase.from("reviews").delete().in("id", ids);
      if (error) toast.error("Ошибка");
      else {
        setReviews((prev) => prev.filter((r) => !ids.includes(r.id)));
        toast.success(`${ids.length} отзывов удалено`);
      }
    }
    setSelectedIds(new Set());
    setBulkAction(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  // Filter + sort
  const filtered = useMemo(() => {
    let result = reviews;

    // Status filter
    if (filterStatus === "visible") result = result.filter((r) => r.is_visible);
    else if (filterStatus === "hidden") result = result.filter((r) => !r.is_visible);

    // Rating filter
    if (filterRating > 0) result = result.filter((r) => r.rating === filterRating);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.author_name.toLowerCase().includes(q) ||
          r.text.toLowerCase().includes(q) ||
          r.recipes?.title.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "date": cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
        case "rating": cmp = a.rating - b.rating; break;
        case "author": cmp = a.author_name.localeCompare(b.author_name); break;
        case "recipe": cmp = (a.recipes?.title || "").localeCompare(b.recipes?.title || ""); break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [reviews, search, filterStatus, filterRating, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  // Stats
  const stats = useMemo(() => {
    const total = reviews.length;
    const visible = reviews.filter((r) => r.is_visible).length;
    const hidden = total - visible;
    const avgRating = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : "—";
    return { total, visible, hidden, avgRating };
  }, [reviews]);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );

  const SortButton = ({ label, sortId }: { label: string; sortId: SortKey }) => (
    <button
      onClick={() => handleSort(sortId)}
      className={`flex items-center gap-1 text-xs font-medium transition-colors ${sortKey === sortId ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Отзывы</h1>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Всего</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Видимые</p>
          <p className="mt-1 font-display text-2xl font-bold text-green-400">{stats.visible}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Скрытые</p>
          <p className="mt-1 font-display text-2xl font-bold text-yellow-400">{stats.hidden}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Средний рейтинг</p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">{stats.avgRating}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {(["all", "visible", "hidden"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {s === "all" ? "Все" : s === "visible" ? "Видимые" : "Скрытые"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            <button
              onClick={() => setFilterRating(0)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filterRating === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <Filter className="h-3 w-3" />
            </button>
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRating(filterRating === r ? 0 : r as FilterRating)}
                className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${filterRating === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
              >
                {r}★
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground font-medium">{selectedIds.size} выбрано</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={() => { setBulkAction("show"); handleBulkAction(); }} className="text-xs">
              <Eye className="h-3 w-3 mr-1" /> Показать
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setBulkAction("hide"); handleBulkAction(); }} className="text-xs">
              <EyeOff className="h-3 w-3 mr-1" /> Скрыть
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkAction("delete")} className="text-xs">
              <Trash2 className="h-3 w-3 mr-1" /> Удалить
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{search || filterStatus !== "all" || filterRating > 0 ? "Ничего не найдено" : "Пока нет отзывов"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Sort header */}
          <div className="flex items-center gap-4 px-4 py-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.size === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-border"
              />
            </label>
            <div className="grid grid-cols-[1fr_120px_80px_2fr_80px_90px_100px] gap-3 flex-1 items-center">
              <SortButton label="Напиток" sortId="recipe" />
              <SortButton label="Автор" sortId="author" />
              <SortButton label="Рейтинг" sortId="rating" />
              <span className="text-xs font-medium text-muted-foreground">Текст</span>
              <span className="text-xs font-medium text-muted-foreground">Статус</span>
              <SortButton label="Дата" sortId="date" />
              <span className="text-xs font-medium text-muted-foreground text-right">Действия</span>
            </div>
          </div>

          {/* Review rows */}
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-all hover:border-primary/20 ${
                !r.is_visible ? "opacity-50" : ""
              } ${selectedIds.has(r.id) ? "ring-1 ring-primary/30 bg-primary/5" : ""}`}
            >
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.id)}
                  onChange={() => toggleSelect(r.id)}
                  className="rounded border-border"
                />
              </label>
              <div className="grid grid-cols-[1fr_120px_80px_2fr_80px_90px_100px] gap-3 flex-1 items-center min-w-0">
                <span className="text-sm font-medium text-foreground truncate">{r.recipes?.title || "—"}</span>
                <span className="text-sm text-muted-foreground truncate">{r.author_name}</span>
                <div>{renderStars(r.rating)}</div>
                <p className="text-sm text-muted-foreground truncate">{r.text}</p>
                <Badge variant={r.is_visible ? "default" : "secondary"} className="w-fit text-xs">
                  {r.is_visible ? "Виден" : "Скрыт"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("ru")}
                </span>
                <div className="flex justify-end gap-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleVisibility(r.id, r.is_visible)}
                    title={r.is_visible ? "Скрыть" : "Показать"}>
                    {r.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm(r.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editReview} onOpenChange={() => setEditReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Редактировать отзыв</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            {editReview && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Напиток:</span>
                <span className="font-medium text-foreground">{editReview.recipes?.title}</span>
                <span className="ml-auto">{renderStars(editReview.rating)}</span>
              </div>
            )}
            <div>
              <Label>Автор</Label>
              <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
            </div>
            <div>
              <Label>Текст</Label>
              <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={4} />
              <p className="mt-1 text-xs text-muted-foreground">{editText.length}/1000</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReview(null)}>Отмена</Button>
            <Button onClick={handleEditSave} disabled={!editAuthor.trim() || !editText.trim()}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm || bulkAction === "delete"} onOpenChange={() => { setDeleteConfirm(null); setBulkAction(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "delete" ? `Удалить ${selectedIds.size} отзывов?` : "Удалить отзыв?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirm(null); setBulkAction(null); }}>Отмена</Button>
            <Button variant="destructive" onClick={() => {
              if (bulkAction === "delete") {
                handleBulkAction();
              } else if (deleteConfirm) {
                handleDelete(deleteConfirm);
              }
            }}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
