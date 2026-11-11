import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";

interface ConfirmButtonProps {
  /** Accessible name and announcement while the button waits for the second press. */
  armedLabel: string;
  children: ReactNode;
  className?: string;
  /** Presses right after arming are ignored so a double tap cannot confirm by accident. */
  guardMs?: number;
  idleLabel: string;
  onConfirm: () => void;
  timeoutMs?: number;
}

/**
 * Two-step confirmation without a dialog: the first press turns the button red for a few seconds,
 * a second press within that time confirms the action.
 */
export function ConfirmButton({
  armedLabel,
  children,
  className = "",
  guardMs = 400,
  idleLabel,
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
        variant={armed ? "danger" : "secondary"}
        onClick={handleClick}
      >
        {children}
      </Button>
      <span className="visually-hidden" role="status">
        {armed ? armedLabel : ""}
      </span>
    </>
  );
}
