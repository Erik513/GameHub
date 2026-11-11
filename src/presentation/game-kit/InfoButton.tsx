import { useState, type ReactNode } from "react";
import { Button, Dialog } from "../components";

export interface InfoContent {
  /** Text of the close button inside the dialog. */
  readonly closeLabel: string;
  /** Accessible name of the info button, for example "Info about rounds". */
  readonly label: string;
  /** Explanation shown in the dialog. */
  readonly text: ReactNode;
  readonly title: string;
}

/** A small "i" button that opens a dialog explaining a setting. */
export function InfoButton({ closeLabel, label, text, title }: InfoContent) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        aria-label={label}
        className="icon-button kit-info-button"
        title={label}
        variant="quiet"
        onClick={() => setOpen(true)}
      >
        <svg aria-hidden="true" focusable="false" height="20" viewBox="0 0 24 24" width="20">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 11v5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2.2"
          />
          <circle cx="12" cy="7.8" r="1.3" fill="currentColor" />
        </svg>
      </Button>
      <Dialog closeLabel={closeLabel} onClose={() => setOpen(false)} open={open} title={title}>
        <p className="kit-info-text">{text}</p>
      </Dialog>
    </>
  );
}
