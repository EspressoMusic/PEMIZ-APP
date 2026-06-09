"use client";

import { useRef, useState } from "react";
import type { AppLocale } from "@/lib/app-locale";
import { uploadProductImageBlob } from "@/lib/product-image";
import { isAllowedImageMime, maxImageBytes } from "@/lib/upload-image";

const SOURCE_MAX_BYTES = 8 * 1024 * 1024;

export function useCatalogImageUpload({
  locale,
  labels,
  onError,
  onUploaded,
  onUploadingChange,
}: {
  locale: AppLocale;
  labels: {
    productImageTypeError: string;
    productImageSizeError: string;
    productImageReadError: string;
  };
  onError: (msg: string) => void;
  onUploaded: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState("image.jpg");
  const [uploading, setUploading] = useState(false);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function openCropFromFile(file: File) {
    if (!isAllowedImageMime(file.type)) {
      onError(labels.productImageTypeError);
      resetInput();
      return;
    }
    if (file.size > SOURCE_MAX_BYTES) {
      onError(labels.productImageSizeError);
      resetInput();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        onError(labels.productImageReadError);
        resetInput();
        return;
      }
      setSourceFileName(file.name);
      setCropSrc(result);
    };
    reader.onerror = () => {
      onError(labels.productImageReadError);
      resetInput();
    };
    reader.readAsDataURL(file);
  }

  function openCropFromUrl(url: string, fileName = "image.jpg") {
    setSourceFileName(fileName);
    setCropSrc(url);
  }

  function closeCrop() {
    setCropSrc(null);
    resetInput();
  }

  async function confirmCrop(blob: Blob) {
    if (blob.size > maxImageBytes()) {
      onError(labels.productImageSizeError);
      return;
    }
    setUploading(true);
    onUploadingChange?.(true);
    try {
      const url = await uploadProductImageBlob(blob, sourceFileName, locale);
      onUploaded(url);
      closeCrop();
    } catch (e) {
      onError(e instanceof Error ? e.message : labels.productImageReadError);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  return {
    inputRef,
    cropSrc,
    uploading,
    openCropFromFile,
    openCropFromUrl,
    closeCrop,
    confirmCrop,
    openFilePicker: () => inputRef.current?.click(),
  };
}
