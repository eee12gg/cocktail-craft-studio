import { useState, useRef, useCallback } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Upload, X, Crop, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null, thumbUrl?: string | null) => void;
  folder?: string;
  aspectRatio?: number;
  className?: string;
}

function generateFilename(prefix: string): string {
  const hash = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now();
  return `${prefix}-${timestamp}-${hash}`;
}

async function canvasToWebPBlob(canvas: HTMLCanvasElement, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      "image/webp",
      quality
    );
  });
}

function resizeCanvas(source: HTMLCanvasElement, maxWidth: number): HTMLCanvasElement {
  if (source.width <= maxWidth) return source;
  const ratio = maxWidth / source.width;
  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = Math.round(source.height * ratio);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export default function ImageUpload({ value, onChange, folder = "ingredients", aspectRatio = 1, className }: ImageUploadProps) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      toast.error("Допустимые форматы: JPG, PNG");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Максимальный размер файла: 10 МБ");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleCropAndUpload = useCallback(async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    setUploading(true);
    try {
      const croppedCanvas = cropper.getCroppedCanvas({ imageSmoothingQuality: "high" });

      // Generate main (800px) and thumbnail (150px)
      const mainCanvas = resizeCanvas(croppedCanvas, 800);
      const thumbCanvas = resizeCanvas(croppedCanvas, 150);

      const [mainBlob, thumbBlob] = await Promise.all([
        canvasToWebPBlob(mainCanvas),
        canvasToWebPBlob(thumbCanvas, 0.75),
      ]);

      const baseName = generateFilename(folder);
      const mainPath = `${folder}/${baseName}.webp`;
      const thumbPath = `${folder}/${baseName}-thumb.webp`;

      const [mainUpload, thumbUpload] = await Promise.all([
        supabase.storage.from("images").upload(mainPath, mainBlob, { contentType: "image/webp", upsert: true }),
        supabase.storage.from("images").upload(thumbPath, thumbBlob, { contentType: "image/webp", upsert: true }),
      ]);

      if (mainUpload.error) throw mainUpload.error;
      if (thumbUpload.error) throw thumbUpload.error;

      const { data: { publicUrl: mainUrl } } = supabase.storage.from("images").getPublicUrl(mainPath);
      const { data: { publicUrl: thumbUrl } } = supabase.storage.from("images").getPublicUrl(thumbPath);

      onChange(mainUrl, thumbUrl);
      setCropDialogOpen(false);
      toast.success("Изображение загружено");
    } catch (err: any) {
      console.error(err);
      toast.error("Ошибка загрузки: " + (err.message || "неизвестная ошибка"));
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  const handleRemove = useCallback(() => {
    onChange(null, null);
  }, [onChange]);

  return (
    <div className={className}>
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-muted">
          <img src={value} alt="Preview" className="w-full aspect-square object-cover" />
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
              <Crop className="h-4 w-4 mr-1" /> Заменить
            </Button>
            <Button size="sm" variant="destructive" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Upload className="h-8 w-8" />
          <span className="text-sm">Загрузить изображение</span>
          <span className="text-xs">JPG, PNG до 10 МБ</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Обрезка изображения</DialogTitle>
          </DialogHeader>
          {previewSrc && (
            <div className="max-h-[60vh] overflow-hidden">
              <Cropper
                ref={cropperRef}
                src={previewSrc}
                style={{ height: "100%", maxHeight: "55vh", width: "100%" }}
                aspectRatio={aspectRatio}
                guides
                viewMode={1}
                autoCropArea={0.9}
                responsive
              />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => cropperRef.current?.cropper.rotate(90)}
              disabled={uploading}
            >
              <RotateCw className="h-4 w-4 mr-1" /> Повернуть
            </Button>
            <Button onClick={handleCropAndUpload} disabled={uploading}>
              {uploading ? "Загрузка..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
