"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";

interface ToastOptions {
  tone?: "info" | "error";
  /** Shows an "Undo" button. May throw: the failure is shown as an error toast. */
  undo?: () => Promise<void> | void;
}

interface ToastApi {
  show: (message: string, options?: ToastOptions) => void;
}

interface ToastState extends ToastOptions {
  message: string;
}

const ToastContext = createContext<ToastApi | null>(null);

const DURATION_MS = 6000;

/** One toast at a time, bottom-centre. Used for confirmations, errors and undo. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((message: string, options: ToastOptions = {}) => {
    clearTimeout(timer.current);
    setToast({ message, ...options });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function undo() {
    const action = toast?.undo;
    clearTimeout(timer.current);
    setToast(null);
    if (!action) return;
    try {
      await action();
    } catch (e) {
      show(errorMessage(e), { tone: "error" });
    }
  }

  const api = useMemo<ToastApi>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <div
          role={toast.tone === "error" ? "alert" : "status"}
          className={cn(
            "fixed bottom-6 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-4 rounded-lg border px-4 py-2.5 text-sm shadow-lg",
            toast.tone === "error" ? "border-red-400/50 bg-red-950 text-red-100" : "border-white/20 bg-slate-900 text-white",
          )}
        >
          <span>{toast.message}</span>
          {toast.undo && (
            <button type="button" onClick={undo} className="min-h-9 font-bold text-jeopardy-gold hover:brightness-110">
              Undo
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
