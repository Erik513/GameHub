import { useEffect, useRef, type ReactNode } from "react";

interface HoldButtonProps {
  readonly children: ReactNode;
  readonly disabled: boolean;
  readonly label: string;
  /** One step (one more or one less). It is called once at the press and then again and again while the button is held. */
  readonly onStep: () => void;
}

/** After this time the held button starts to repeat, and then repeats at this interval (milliseconds). */
const startDelay = 400;
const repeatEvery = 90;

/**
 * A button that steps once when pressed and keeps stepping while it is held down (mouse, finger or pen), so the narrator
 * can count up or down quickly. The keyboard (Enter, Space) steps once per press. The holding stops when the button is
 * released, when the pointer leaves it or when the button is switched off (the limit is reached).
 */
export function HoldButton({ children, disabled, label, onStep }: HoldButtonProps) {
  // The newest step function: the repeats always work with the numbers of the last render.
  const step = useRef(onStep);
  useEffect(() => {
    step.current = onStep;
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stop = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  useEffect(() => {
    if (disabled) stop();
  }, [disabled]);
  const repeat = () => {
    step.current();
    timer.current = setTimeout(repeat, repeatEvery);
  };
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        // A click with a pointer (detail > 0) was handled by the press already; a click without (keyboard) steps once.
        if (event.detail === 0) step.current();
      }}
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={stop}
      onPointerDown={(event) => {
        if (event.button !== 0 || disabled) return;
        stop();
        step.current();
        timer.current = setTimeout(repeat, startDelay);
      }}
      onPointerLeave={stop}
      onPointerUp={stop}
      type="button"
    >
      {children}
    </button>
  );
}
