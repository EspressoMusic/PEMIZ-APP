"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { readProductImageFile } from "@/lib/product-image";

export function ProductImageField({
  preview,
  onChange,
  onError,
}: {
  preview: string | null;
  onChange: (dataUrl: string | null) => void;
  onError: (msg: string) => void;
}) {
  const { labels, locale } = useAppLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    try {
      const dataUrl = await readProductImageFile(file, locale);
      onChange(dataUrl);
    } catch (e) {
      onError(e instanceof Error ? e.message : labels.productImageReadError);
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
            className="aspect-[4/3] w-full object-cover"
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
          onClick={() => inputRef.current?.click()}
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
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 transition ${
            dragOver
              ? "border-bakery-primary bg-bakery-primary/8"
              : "border-bakery-border/50 bg-bakery-input/80 hover:border-bakery-primary/50"
          }`}
        >
          <ImagePlus className="h-8 w-8 text-bakery-muted" strokeWidth={1.5} />
          <span className="text-[14px] font-bold text-bakery-ink">
            {labels.productImageUpload}
          </span>
          <span className="text-[12px] text-bakery-muted">
            {labels.productImageDropHint}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
