import { useState, type ReactNode } from "react";
import { InfoButton, type InfoContent } from "./InfoButton";

interface InfoLegendProps {
  /** Extra controls at the right end of the heading line, for example a flat heading button. */
  readonly children?: ReactNode;
  /** Id of the heading text; the fieldset points to it with `aria-labelledby`. */
  readonly id: string;
  readonly info: InfoContent;
  readonly legend: string;
}

/**
 * The heading of a group that has an info button. Rule for every such heading: the info button
 * stands directly next to the heading text, and a tap on the heading text opens the same window.
 * The fieldset names itself with `aria-labelledby={id}`, so the info button does not become part
 * of the group's name.
 */
export function InfoLegend({ children, id, info, legend }: InfoLegendProps) {
  const [open, setOpen] = useState(false);
  return (
    <legend className="kit-info-legend">
      <button
        className="kit-info-legend__title"
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
      {children}
    </legend>
  );
}
