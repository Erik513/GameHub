import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";

interface ConfirmButtonProps {
  /** Accessible name and announcement while the button waits for the second press. */
  armedLabel: string;
  /** Visible content while armed; defaults to the armed label so users see what a second tap does. */
  armedContent?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Presses right after arming are ignored so a double tap cannot confirm by accident. */
  guardMs?: number;
  idleLabel: string;
  /** Look of the button before it is armed; "danger" shows it red from the start. */
  idleVariant?: "secondary" | "danger";
  onConfirm: () => void;
  timeoutMs?: number;
}

/**
 * Two-step confirmation without a dialog: the first press turns the button red for a few seconds,
 * a second press within that time confirms the action.
 */
export function ConfirmButton({
  armedContent,
  armedLabel,
  children,
  className = "",
  guardMs = 400,
  idleLabel,
  idleVariant = "secondary",
  onConfirm,
  timeoutMs = 3000,
}: ConfirmButtonProps) {
  const [armed, setArmed] = useState(false);
  const armedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleClick() {
    if (!armed) {
      armedAt.current = Date.now();
      setArmed(true);
      timer.current = setTimeout(() => setArmed(false), timeoutMs);
      return;
    }
    if (Date.now() - armedAt.current < guardMs) return;
    clearTimeout(timer.current);
    setArmed(false);
    onConfirm();
  }

  return (
    <>
      <Button
        aria-label={armed ? armedLabel : idleLabel}
        className={`confirm-button ${className}`.trim()}
        data-armed={armed}
        title={armed ? armedLabel : idleLabel}
        variant={armed ? "danger" : idleVariant}
        onClick={handleClick}
      >
        {armed ? (armedContent ?? armedLabel) : children}
      </Button>
      <span className="visually-hidden" role="status">
        {armed ? armedLabel : ""}
      </span>
    </>
  );
}
