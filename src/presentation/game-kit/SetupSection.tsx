import { useId, type ReactNode } from "react";

interface SetupSectionProps {
  readonly children: ReactNode;
  /** Whether the chapter starts expanded; defaults to true. */
  readonly defaultOpen?: boolean;
  readonly title: string;
}

/**
 * One chapter of a setup screen with a heading, for example "Teams and players".
 * It can be collapsed; the content stays in the form, so collapsed values are still submitted.
 */
export function SetupSection({ children, defaultOpen = true, title }: SetupSectionProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="kit-setup-section">
      <details className="kit-chapter" open={defaultOpen}>
        <summary>
          <h2 id={headingId}>{title}</h2>
        </summary>
        <div className="kit-setup-section__body">{children}</div>
      </details>
    </section>
  );
}
