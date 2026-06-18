"use client";

import { useState } from "react";
import { Crop, ImagePlus, X } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { ImageCropModal } from "@/components/image-crop-modal";
import { useCatalogImageUpload } from "@/components/use-catalog-image-upload";
import { MAX_PRODUCT_IMAGES } from "@/lib/product-image-urls";

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
  return (
    <ProductImagesField
      images={preview ? [preview] : []}
      onChange={(urls) => onChange(urls[0] ?? null)}
      onError={onError}
      onUploadingChange={onUploadingChange}
      compact={compact}
      maxImages={1}
    />
  );
}

export function ProductImagesField({
  images,
  onChange,
  onError,
  onUploadingChange,
  compact = false,
  maxImages = MAX_PRODUCT_IMAGES,
}: {
  images: string[];
  onChange: (imageUrls: string[]) => void;
  onError: (msg: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  compact?: boolean;
  maxImages?: number;
}) {
  const { labels, locale } = useAppLocale();
  const [dragOver, setDragOver] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const upload = useCatalogImageUpload({
    locale,
    labels,
    onError,
    onUploaded: (url) => {
      if (replaceIndex == null) {
        if (images.length >= maxImages) {
          onError(labels.productImagesLimit);
          return;
        }
        onChange([...images, url]);
      } else {
        const next = [...images];
        next[replaceIndex] = url;
        onChange(next);
      }
      setReplaceIndex(null);
    },
    onUploadingChange,
  });

  function handleFile(file: File | null) {
    if (!file) return;
    if (images.length >= maxImages && replaceIndex == null) {
      onError(labels.productImagesLimit);
      return;
    }
    upload.openCropFromFile(file);
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function startReplace(index: number) {
    setReplaceIndex(index);
    upload.openCropFromUrl(images[index]!);
  }

  function startAdd() {
    setReplaceIndex(null);
    upload.openFilePicker();
  }

  const canAdd = images.length < maxImages;
  const tileCount = images.length + (canAdd ? 1 : 0);
  const centerSingleTile = tileCount === 1;
  const slotClass = compact
    ? "aspect-square min-h-[72px]"
    : "aspect-square min-h-[96px]";
  const singleTileWidth = compact ? "w-[min(100%,132px)]" : "w-[min(100%,168px)]";
  const tileSizeClass = centerSingleTile ? singleTileWidth : "w-full";

  return (
    <div className="w-full text-center">
      <div
        className={
          centerSingleTile
            ? "flex justify-center"
            : "grid grid-cols-2 gap-2"
        }
      >
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={`relative overflow-hidden rounded-2xl border-[1.5px] border-bakery-border/40 bg-bakery-card ${slotClass} ${tileSizeClass}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={labels.productImagePreviewAlt}
              className="h-full w-full object-cover"
            />
            <div className="absolute left-1.5 top-1.5 flex gap-1">
              <button
                type="button"
                onClick={() => startReplace(index)}
                disabled={upload.uploading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-bakery-ink/70 text-white"
                aria-label={labels.productImageEdit}
              >
                <Crop className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={upload.uploading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-bakery-ink/70 text-white"
                aria-label={labels.productImageRemove}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {canAdd ? (
          <button
            type="button"
            onClick={() => !upload.uploading && startAdd()}
            disabled={upload.uploading}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              setReplaceIndex(null);
              void handleFile(e.dataTransfer.files[0] ?? null);
            }}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${slotClass} ${tileSizeClass} ${
              compact ? "gap-1 px-2 py-2" : "gap-2 px-3 py-4"
            } ${
              dragOver
                ? "border-bakery-primary bg-bakery-primary/8"
                : "border-bakery-border/50 bg-bakery-input/80 hover:border-bakery-primary/50"
            }`}
          >
            <ImagePlus
              className={`text-bakery-muted ${compact ? "h-5 w-5" : "h-7 w-7"}`}
              strokeWidth={1.5}
            />
            <span
              className={`font-bold text-bakery-ink ${compact ? "text-[11px]" : "text-[13px]"}`}
            >
              {upload.uploading ? labels.productImageUploading : labels.productImageUpload}
            </span>
          </button>
        ) : null}
      </div>

      {maxImages > 1 ? (
        <p className="mt-2 text-[12px] font-semibold text-bakery-muted">
          {labels.productImagesHint} ({images.length}/{maxImages})
        </p>
      ) : null}

      <input
        ref={upload.inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0] ?? null);
        }}
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
          onClose={() => {
            setReplaceIndex(null);
            upload.closeCrop();
          }}
          onConfirm={upload.confirmCrop}
        />
      ) : null}
    </div>
  );
}
