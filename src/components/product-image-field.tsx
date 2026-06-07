"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { uploadProductImageFile } from "@/lib/product-image";

export function ProductImageField({
  preview,
  onChange,
  onError,
  onUploadingChange,
  compact = false,
}: {
  preview: string | null;
  onChange: (imageUrl: string | null) => void;
  onError: (msg: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  compact?: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadProductImageFile(file, locale);
      onChange(url);
    } catch (e) {
      onError(e instanceof Error ? e.message : labels.productImageReadError);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="w-full text-center">
      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-bakery-border/40 bg-bakery-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={labels.productImagePreviewAlt}
            className={`w-full object-cover ${compact ? "aspect-square max-h-[100px]" : "aspect-[4/3]"}`}
          />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-bakery-ink/70 text-white"
            aria-label={labels.productImageRemove}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files[0] ?? null);
          }}
          className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
            compact ? "gap-1 px-3 py-4" : "gap-2 px-4 py-8"
          } ${
            dragOver
              ? "border-bakery-primary bg-bakery-primary/8"
              : "border-bakery-border/50 bg-bakery-input/80 hover:border-bakery-primary/50"
          }`}
        >
          <ImagePlus
            className={`text-bakery-muted ${compact ? "h-6 w-6" : "h-8 w-8"}`}
            strokeWidth={1.5}
          />
          <span className={`font-bold text-bakery-ink ${compact ? "text-[12px]" : "text-[14px]"}`}>
            {uploading ? labels.productImageUploading : labels.productImageUpload}
          </span>
          {!compact && (
            <span className="text-[12px] text-bakery-muted">
              {labels.productImageDropHint}
            </span>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
