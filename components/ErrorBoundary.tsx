"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-6xl">⚠</p>
      <h1 className="mt-4 font-display text-3xl tracking-wider">OOPS</h1>
      <p className="mt-4 text-sm text-ink/70">
        Something went wrong. Try refreshing the page, or go back and try again.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-ink/50">ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-ink px-6 py-3 font-display text-xl
                   tracking-widest text-paper transition hover:bg-black"
      >
        TRY AGAIN
      </button>
    </main>
  );
}
