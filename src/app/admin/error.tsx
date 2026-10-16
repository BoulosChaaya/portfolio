"use client";

import Link from "next/link";

/** If something on an admin page still fails, keep the dashboard and offer a way back. */
export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="max-w-md space-y-4 rounded-xl border bg-white p-6 dark:bg-zinc-900">
      <h1 className="text-lg font-semibold">This page could not load.</h1>
      <p className="text-sm text-zinc-500">Nothing was lost. Try again; if your session ended, sign in again.</p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="rounded-md border px-3 py-1.5 text-sm">Try again</button>
        <Link href="/login" className="rounded-md px-3 py-1.5 text-sm text-blue-600 hover:underline">Sign in</Link>
      </div>
    </div>
  );
}
