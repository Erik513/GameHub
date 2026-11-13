import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const stackId = "gamehub-toasts";

/** The one place where all notifications are shown, created on first use. */
function toastStack(): HTMLElement {
  let stack = document.getElementById(stackId);
  if (!stack) {
    stack = document.createElement("div");
    stack.id = stackId;
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}

interface ToastProps {
  children: ReactNode;
  /** How long the notification stays, in milliseconds. */
  duration?: number;
  /** Called when the notification has disappeared. */
  onClose?: () => void;
  /** A bold first line; leave it out for a short message that says everything itself. */
  title?: string;
  tone?: "error" | "info" | "success";
}

/**
 * A short notification that disappears by itself after a few seconds. It does not take space in
 * the page and does not catch taps. Give it a new `key` to show the same message again.
 */
export function Toast({ children, duration = 5000, onClose, title, tone = "info" }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const closed = useRef(onClose);

  useEffect(() => {
    closed.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      closed.current?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;
  return createPortal(
    <section className="toast" data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </section>,
    toastStack(),
  );
}
