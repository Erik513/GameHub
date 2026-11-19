import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface DialogProps {
  children: ReactNode;
  closeLabel: string;
  description?: string;
  onClose: () => void;
  open: boolean;
  /** A large window for lists: wider and as high as the screen allows. */
  size?: "large";
  title: string;
  /** Something next to the title, for example a small box with a status. */
  titleExtra?: ReactNode;
}

export function Dialog({
  children,
  closeLabel,
  description,
  onClose,
  open,
  size,
  title,
  titleExtra,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // The latest close handler is kept in a ref so a new function on every render does not move the
  // focus back to the close button while someone types in the window.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) {
    return null;
  }

  // The window is attached to the page itself, so no parent (for example the sticky header with its
  // blur) can change where it sits.
  return createPortal(
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={size === "large" ? "dialog dialog--large" : "dialog"}
        role="dialog"
      >
        <div className="dialog__header">
          {titleExtra ? (
            <div className="dialog__title">
              <h2 id={titleId}>{title}</h2>
              {titleExtra}
            </div>
          ) : (
            <h2 id={titleId}>{title}</h2>
          )}
          <Button
            ref={closeButtonRef}
            aria-label={closeLabel}
            className="icon-button dialog__close"
            title={closeLabel}
            variant="secondary"
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
    </div>,
    document.body,
  );
}
