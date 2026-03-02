import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Search, MessageSquare, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
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

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editReview, setEditReview] = useState<ReviewRow | null>(null);
  const [editText, setEditText] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*, recipes(title, slug)")
      .order("created_at", { ascending: false });
    if (error) toast.error("Ошибка загрузки отзывов");
    else setReviews((data as ReviewRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const toggleVisibility = async (id: string, current: boolean) => {
    const { error } = await supabase.from("reviews").update({ is_visible: !current }).eq("id", id);
    if (error) toast.error("Ошибка");
    else { toast.success(current ? "Отзыв скрыт" : "Отзыв показан"); fetchReviews(); }
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
    else { toast.success("Отзыв обновлён"); setEditReview(null); fetchReviews(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error("Ошибка удаления");
    else { toast.success("Отзыв удалён"); fetchReviews(); }
    setDeleteConfirm(null);
  };

  const filtered = reviews.filter((r) =>
    r.author_name.toLowerCase().includes(search.toLowerCase()) ||
    r.text.toLowerCase().includes(search.toLowerCase()) ||
    r.recipes?.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Отзывы</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{search ? "Ничего не найдено" : "Пока нет отзывов"}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Напиток</TableHead>
                <TableHead>Автор</TableHead>
                <TableHead>Рейтинг</TableHead>
                <TableHead className="max-w-[300px]">Текст</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className={!r.is_visible ? "opacity-50" : ""}>
                  <TableCell className="font-medium text-sm">{r.recipes?.title || "—"}</TableCell>
                  <TableCell className="text-sm">{r.author_name}</TableCell>
                  <TableCell>{renderStars(r.rating)}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">{r.text}</TableCell>
                  <TableCell>
                    <Badge variant={r.is_visible ? "default" : "secondary"}>
                      {r.is_visible ? "Виден" : "Скрыт"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("ru")}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleVisibility(r.id, r.is_visible)}
                      title={r.is_visible ? "Скрыть" : "Показать"}>
                      {r.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editReview} onOpenChange={() => setEditReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Редактировать отзыв</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div>
              <Label>Автор</Label>
              <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
            </div>
            <div>
              <Label>Текст</Label>
              <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditReview(null)}>Отмена</Button>
            <Button onClick={handleEditSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Удалить отзыв?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
