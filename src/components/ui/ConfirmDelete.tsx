"use client";

import { useState } from "react";
import { toApiError } from "@/lib/api/client";
import { Button } from "./Button";

interface ConfirmDeleteProps {
  /** Question shown on the second step, e.g. `Delete "Science"?` */
  prompt: string;
  /** Should throw on failure. On success the parent usually unmounts this component. */
  onConfirm: () => Promise<void>;
  label?: string;
}

/** Small two-step delete button (no modal). */
export function ConfirmDelete({ prompt, onConfirm, label = "Delete" }: ConfirmDeleteProps) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(toApiError(e).message);
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-white/70">{prompt}</p>
      <div className="flex gap-1.5">
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => { setConfirming(false); setError(null); }}>
          Cancel
        </Button>
        <Button size="sm" variant="danger" loading={busy} onClick={confirm}>
          Yes, delete
        </Button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
