"use client";

import { useEffect } from "react";

/**
 * Kök layout dışında oluşan hatalar — `html`/`body` zorunlu (Next.js).
 * CSS değişkenleri yüklenmemiş olabilir; sınırlı inline benzeri sınıflar kullanıldı.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[global-error]", error);
    }
  }, [error]);

  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafafa", color: "#171717" }}>
        <div style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Uygulama yüklenemedi</h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", opacity: 0.8 }}>Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          {process.env.NODE_ENV === "development" ? (
            <pre style={{ marginTop: "1rem", maxHeight: "10rem", overflow: "auto", textAlign: "left", fontSize: "0.75rem", background: "#fff", padding: "0.75rem", border: "1px solid #ddd", borderRadius: "6px" }}>
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              borderRadius: "9999px",
              border: "none",
              padding: "0.65rem 1.5rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Yeniden dene
          </button>
        </div>
      </body>
    </html>
  );
}
