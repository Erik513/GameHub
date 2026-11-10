import type { ReactNode } from "react";

interface StatusMessageProps {
  busy?: boolean;
  children: ReactNode;
  title: string;
  tone?: "error" | "info" | "success";
}

export function StatusMessage({
  busy = false,
  children,
  title,
  tone = "info",
}: StatusMessageProps) {
  return (
    <section
      aria-busy={busy || undefined}
      className="status-message"
      data-tone={tone}
      role={tone === "error" ? "alert" : "status"}
    >
      <strong>{title}</strong>
      <div>{children}</div>
    </section>
  );
}
