import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";

interface DialogProps {
  children: ReactNode;
  closeLabel: string;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
}

export function Dialog({ children, closeLabel, description, onClose, open, title }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className="dialog"
        role="dialog"
      >
        <div className="dialog__header">
          <h2 id={titleId}>{title}</h2>
          <Button
            ref={closeButtonRef}
            aria-label={closeLabel}
            className="icon-button dialog__close"
            title={closeLabel}
            variant="quiet"
            onClick={onClose}
          >
            <svg aria-hidden="true" focusable="false" height="18" viewBox="0 0 24 24" width="18">
              <path
                d="M5 5l14 14M19 5L5 19"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </svg>
          </Button>
        </div>
        {description ? <p id={descriptionId}>{description}</p> : null}
        <div className="dialog__content">{children}</div>
      </section>
    </div>
  );
}
