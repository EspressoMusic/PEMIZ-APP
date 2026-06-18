"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { Button } from "@/components/ui";
import { cropImageToSquareBlob } from "@/lib/image-crop";

export function ImageCropModal({
  open,
  imageSrc,
  title,
  hint,
  cancelLabel,
  confirmLabel,
  processingLabel,
  errorLabel,
  zoomLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  imageSrc: string;
  title: string;
  hint: string;
  cancelLabel: string;
  confirmLabel: string;
  processingLabel: string;
  errorLabel: string;
  zoomLabel: string;
  onClose: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError("");
  }, [open, imageSrc]);

  async function handleConfirm() {
    if (!croppedAreaPixels || processing) return;
    setProcessing(true);
    setError("");
    try {
      const blob = await cropImageToSquareBlob(imageSrc, croppedAreaPixels);
      await onConfirm(blob);
    } catch {
      setError(errorLabel);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <DashboardActionSheet
      open={open}
      onClose={onClose}
      title={title}
      ariaLabel={title}
      placement="center"
      showBackButton
      compact
      fitContent
      topLayer
    >
      <div className="flex flex-col gap-3 px-1 pb-1 text-center">
        <p className="text-[13px] font-semibold leading-snug text-bakery-muted">
          {hint}
        </p>

        <div className="relative mx-auto aspect-square w-full max-w-[min(100%,320px)] overflow-hidden rounded-2xl bg-bakery-ink/90">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <label className="flex items-center gap-3 px-1 text-start">
          <span className="shrink-0 text-[12px] font-bold text-bakery-muted">
            {zoomLabel}
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-bakery-primary"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-[13px] font-semibold text-bakery-error"
          >
            {error}
          </p>
        ) : null}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="min-h-[44px] flex-1 font-extrabold"
            disabled={processing}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="min-h-[44px] flex-1 font-extrabold"
            disabled={processing || !croppedAreaPixels}
            onClick={() => void handleConfirm()}
          >
            {processing ? processingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </DashboardActionSheet>
  );
}
