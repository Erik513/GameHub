import { useState, type ReactNode } from "react";
import { InfoButton, type InfoContent } from "./InfoButton";

interface HeadingLegendProps {
  /** Extra controls at the right end of the heading line, for example flat heading buttons. */
  readonly children?: ReactNode;
  /** Id of the heading text (with `info`); the fieldset points to it with `aria-labelledby`. */
  readonly id?: string;
  /** Adds an info button directly next to the heading text. */
  readonly info?: InfoContent;
  readonly legend: string;
}

/**
 * The heading line of a group. With an info button the rule is: the button stands directly next to
 * the heading text, and a tap on the heading text opens the same window. The fieldset then names
 * itself with `aria-labelledby={id}`, so the info button does not become part of the group's name.
 * Without `info` it is a plain heading, optionally with flat buttons at its right end.
 */
export function HeadingLegend({ children, id, info, legend }: HeadingLegendProps) {
  const [open, setOpen] = useState(false);
  return (
    <legend className="kit-heading-legend">
      {info ? (
        <>
          <button
            className="kit-heading-legend__title"
            id={id}
            onClick={() => setOpen(true)}
            type="button"
          >
            {legend}
          </button>
          <InfoButton
            {...info}
            className="kit-info-button--inline"
            onOpenChange={setOpen}
            open={open}
          />
        </>
      ) : (
        <span>{legend}</span>
      )}
      {children}
    </legend>
  );
}
