import { useCallback, useRef, useState } from "react";

/**
 * Keeps the last notification of a component. Every `notify` call gets a new number, so showing
 * the same message twice in a row shows the notification twice (use the number as `key`).
 */
export function useNotice<T>() {
  const [notice, setNotice] = useState<{ readonly id: number; readonly value: T }>();
  const counter = useRef(0);
  const notify = useCallback((value: T) => {
    counter.current += 1;
    setNotice({ id: counter.current, value });
  }, []);
  return [notice, notify] as const;
}
