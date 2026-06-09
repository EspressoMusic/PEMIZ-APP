"use client";

import { useState } from "react";
import { Crop, ImagePlus, X } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { ImageCropModal } from "@/components/image-crop-modal";
import { useCatalogImageUpload } from "@/components/use-catalog-image-upload";

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
  const [dragOver, setDragOver] = useState(false);
  const upload = useCatalogImageUpload({
    locale,
    labels,
    onError,
    onUploaded: onChange,
    onUploadingChange,
  });

  function handleFile(file: File | null) {
    if (!file) return;
    upload.openCropFromFile(file);
  }

  return (
    <div className="w-full text-center">
      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-bakery-border/40 bg-bakery-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={labels.productImagePreviewAlt}
            className={`w-full object-cover ${compact ? "aspect-square max-h-[100px]" : "aspect-square"}`}
          />
          <div className="absolute left-2 top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => upload.openCropFromUrl(preview)}
              disabled={upload.uploading}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-bakery-ink/70 text-white"
              aria-label={labels.productImageEdit}
            >
              <Crop className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => !upload.uploading && upload.openFilePicker()}
              disabled={upload.uploading}
              className="flex h-9 items-center rounded-full bg-bakery-ink/70 px-3 text-[12px] font-bold text-white"
            >
              {labels.productImageReplace}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                if (upload.inputRef.current) upload.inputRef.current.value = "";
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-bakery-ink/70 text-white"
              aria-label={labels.productImageRemove}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !upload.uploading && upload.openFilePicker()}
          disabled={upload.uploading}
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
            compact ? "gap-1 px-3 py-3" : "gap-2 px-4 py-8"
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
            {upload.uploading ? labels.productImageUploading : labels.productImageUpload}
          </span>
          {!compact && (
            <span className="text-[12px] text-bakery-muted">
              {labels.productImageDropHint}
            </span>
          )}
        </button>
      )}

      <input
        ref={upload.inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {upload.cropSrc ? (
        <ImageCropModal
          open
          imageSrc={upload.cropSrc}
          title={labels.productImageCropTitle}
          hint={labels.productImageCropHint}
          cancelLabel={labels.cancel}
          confirmLabel={labels.productImageCropConfirm}
          processingLabel={labels.productImageUploading}
          errorLabel={labels.productImageReadError}
          zoomLabel={labels.productImageCropZoom}
          onClose={upload.closeCrop}
          onConfirm={upload.confirmCrop}
        />
      ) : null}
    </div>
  );
}
