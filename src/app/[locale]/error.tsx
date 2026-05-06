"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Surface unhandled errors to the dev console; no third-party reporter
    // (privacy constraint #1, #5).
    console.error(error);
  }, [error]);

  return (
    <main role="alert" style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Something went wrong.</h1>
      <p>Please try again.</p>
      <button type="button" onClick={() => reset()}>
        Retry
      </button>
    </main>
  );
}
