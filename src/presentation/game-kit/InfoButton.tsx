import { useState, type ReactNode } from "react";
import { Button, Dialog } from "../components";

export interface InfoContent {
  /** Text of the close button inside the dialog. */
  readonly closeLabel: string;
  /** Accessible name of the info button, for example "Info about rounds". */
  readonly label: string;
  /** Explanation shown in the dialog. A text with several lines is shown as bullet points. */
  readonly text: ReactNode;
  readonly title: string;
  /** Controls the dialog from outside; without it the button manages the dialog itself. */
  readonly open?: boolean | undefined;
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
}

/** An info button that shows no window itself; the page opens one, for example a shared window. */
export interface InfoAction {
  /** Accessible name of the info button. */
  readonly label: string;
  readonly onOpen: () => void;
}

type InfoButtonProps = (InfoContent | InfoAction) & {
  /** Extra class, for example to place the button inside an option. */
  readonly className?: string;
};

/** A small "i" button that opens a dialog explaining a setting. */
export function InfoButton(props: InfoButtonProps) {
  const { className = "", label } = props;
  const [ownOpen, setOwnOpen] = useState(false);
  const action = "onOpen" in props ? props.onOpen : undefined;
  const content = "onOpen" in props ? undefined : props;
  const open = content?.open ?? ownOpen;
  const setOpen = (next: boolean) => {
    setOwnOpen(next);
    content?.onOpenChange?.(next);
  };

  return (
    <>
      <Button
        aria-label={label}
        className={`icon-button kit-info-button ${className}`.trim()}
        title={label}
        variant="quiet"
        onClick={() => (action ? action() : setOpen(true))}
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
      {content && (
        <Dialog
          closeLabel={content.closeLabel}
          onClose={() => setOpen(false)}
          open={open}
          title={content.title}
        >
          {typeof content.text === "string" && content.text.includes("\n") ? (
            <ul className="kit-info-list">
              {content.text
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line) => (
                  <li key={line}>{line}</li>
                ))}
            </ul>
          ) : typeof content.text === "string" ? (
            <p className="kit-info-text">{content.text}</p>
          ) : (
            <div className="kit-info-text">{content.text}</div>
          )}
        </Dialog>
      )}
    </>
  );
}
