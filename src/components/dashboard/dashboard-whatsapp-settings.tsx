"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button, Alert, Input, Toggle } from "@/components/ui";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardWhatsAppSettings({
  initialEnabled,
  initialPhone,
  ownerPhone,
  serverConfigured,
  previewOnly = false,
}: {
  initialEnabled: boolean;
  initialPhone: string;
  ownerPhone: string;
  serverConfigured: boolean;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [phone, setPhone] = useState(
    initialPhone || ownerPhone || ""
  );
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setError("");
    setMessage("");

    if (previewOnly) {
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3500);
      return;
    }

    if (enabled && phone.trim().length < 9) {
      setError(labels.whatsappInvalidPhone);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/whatsapp-notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, phone: phone.trim() || ownerPhone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? labels.saveError);
        return;
      }
      setMessage(labels.whatsappSaved);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError(labels.networkError);
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setError("");
    setMessage("");

    if (previewOnly) {
      setMessage(labels.whatsappTestOnlyLive);
      setTimeout(() => setMessage(""), 3500);
      return;
    }

    setTesting(true);
    try {
      const res = await fetch(
        "/api/dashboard/whatsapp-notifications?action=test",
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? labels.networkError);
        return;
      }
      setMessage(data.message ?? labels.messageSent);
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setError(labels.networkError);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-4 text-start">
      <div className="flex items-center justify-center gap-2 text-bakery-primary">
        <MessageCircle className="h-8 w-8" strokeWidth={1.75} />
      </div>

      <DashboardHelpText>{labels.whatsappIntro}</DashboardHelpText>

      {!serverConfigured && !previewOnly && (
        <Alert variant="info">{labels.whatsappMetaNote}</Alert>
      )}

      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[18px] border border-bakery-border/25 bg-bakery-cream-light px-3 py-3">
        <span className="text-[15px] font-bold text-bakery-ink">
          {labels.whatsappAlerts}
        </span>
        <Toggle
          enabled={enabled}
          onChange={setEnabled}
          ariaLabel={labels.whatsappAria}
        />
      </label>

      <Input
        label={labels.whatsappPhoneLabel}
        type="tel"
        dir="ltr"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="050-1234567"
        disabled={!enabled}
      />
      {ownerPhone && enabled && (
        <p className="text-center text-[13px] text-bakery-muted">
          {ownerPhone}
        </p>
      )}

      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={save} disabled={saving} className="sm:min-w-[140px]">
          {saving ? labels.saving : labels.whatsappSave}
        </Button>
        <Button
          variant="secondary"
          onClick={sendTest}
          disabled={testing || !enabled}
          className="sm:min-w-[140px]"
        >
          {testing ? labels.sending : labels.whatsappTestSend}
        </Button>
      </div>
    </div>
  );
}
