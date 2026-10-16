"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions/result";

const UNREACHABLE = "Could not reach the server, or the dashboard was updated since this page opened. Reload the page and try again.";

/**
 * Runs an admin action and keeps the screen usable whatever happens: `pending` while it runs,
 * `error` with the server's message when it is refused, and a clear message when the request
 * itself fails (offline, or a newer deployment that no longer knows this page's actions).
 */
export function useAdminAction() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) onSuccess?.();
        else setError(result.error);
      } catch {
        setError(UNREACHABLE);
      }
    });
  }

  return { pending, error, run };
}

export function ActionError({ error }: { error: string | null }) {
  if (!error) return null;
  return <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>;
}

/** A row button (Publish, Delete, Mark read) that reports its own failure next to it. */
export function RowAction({ label, action, confirmText, className }: {
  label: string;
  action: () => Promise<ActionResult>;
  confirmText?: string;
  className?: string;
}) {
  const { pending, error, run } = useAdminAction();
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => { if (!confirmText || window.confirm(confirmText)) run(action); }}
        className={`text-xs hover:underline disabled:opacity-50 ${className ?? "text-zinc-500"}`}
      >
        {pending ? `${label}…` : label}
      </button>
      {error && <span role="alert" className="max-w-56 text-[11px] leading-snug text-red-600 dark:text-red-400">{error}</span>}
    </span>
  );
}
