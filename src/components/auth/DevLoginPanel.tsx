"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { toApiError } from "@/lib/api/client";
import type { MockTokenRequest } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";

const PRESETS: Array<{ label: string; request?: MockTokenRequest }> = [
  { label: "Default dev user" }, // empty body: backend uses its stable default subject
  { label: "Admin", request: { roles: ["ADMIN"] } },
  { label: "Another user", request: { sub: "00000000-0000-0000-0000-000000000002", email: "other.user@example.com" } },
];

/** Mock login mirroring POST /api/public/mock-auth/token. Replace with the real login later. */
export function DevLoginPanel() {
  const { login } = useAuth();
  const [sub, setSub] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(request?: MockTokenRequest) {
    setBusy(true);
    setError(null);
    try {
      await login(request);
    } catch (e) {
      setError(toApiError(e).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md space-y-5">
      <div>
        <h2 className="text-lg font-bold">Dev login</h2>
        <p className="text-sm text-white/50">Mock authentication (backend profile &quot;dev&quot;). Pick an identity:</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.label} variant="secondary" disabled={busy} onClick={() => run(p.request)}>
            {p.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <p className="text-xs uppercase tracking-wide text-white/40">Or custom</p>
        <TextField label="Subject (sub)" value={sub} onChange={(e) => setSub(e.target.value)} placeholder="a UUID, or any string" />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dev.user@example.com" />
        <TextField label="Roles" value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="USER, ADMIN" hint="Comma separated. Empty = USER." />
        <Button
          loading={busy}
          onClick={() =>
            run({
              sub: sub.trim() || undefined,
              email: email.trim() || undefined,
              roles: roles.split(",").map((r) => r.trim()).filter(Boolean),
            })
          }
        >
          Get token
        </Button>
      </div>

      {error && <Alert title="Login failed">{error}</Alert>}
    </Card>
  );
}
