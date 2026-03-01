import { GlassWater } from "lucide-react";

export default function AdminDrinksPlaceholder() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Управление напитками</h1>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <GlassWater className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Конструктор напитков будет реализован на следующем этапе</p>
      </div>
    </div>
  );
}
