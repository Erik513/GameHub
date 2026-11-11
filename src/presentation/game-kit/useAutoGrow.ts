import { useLayoutEffect, type RefObject } from "react";

/** Makes a textarea grow and shrink with its content instead of scrolling. */
export function useAutoGrow(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    // scrollHeight excludes the border, which a border-box textarea includes in its height.
    const border = element.offsetHeight - element.clientHeight;
    element.style.height = `${element.scrollHeight + border}px`;
  }, [ref, value]);
}
