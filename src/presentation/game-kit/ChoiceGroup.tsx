import { useId, useState } from "react";
import { InfoButton, type InfoAction, type InfoContent } from "./InfoButton";
import { InfoLegend } from "./InfoLegend";

export interface ChoiceOption {
  readonly value: string;
  readonly label: string;
  /** Accessible name when the visible label is only a symbol. */
  readonly ariaLabel?: string;
  /** Small secondary text below the label. */
  readonly hint?: string;
  /** Colors the option, for example by difficulty. */
  readonly tone?: "easy" | "medium" | "hard";
  /** An info button inside the option, for example the rules of a game mode. */
  readonly info?: InfoContent | InfoAction;
}

interface ChoiceGroupProps {
  /** Keeps the legend for screen readers only, for example for a switch between two views. */
  readonly hideLegend?: boolean;
  /** Adds an info button directly next to the legend (a tap on the legend opens it, too). */
  readonly info?: InfoContent;
  /** The chosen value at first; with `multiple` and no "all" option a list of values. */
  readonly initial: string | readonly string[];
  readonly legend: string;
  /**
   * Allows several choices. The option with the empty value means "all": it excludes the
   * others, and picking every other option (or none) falls back to it. Only the real choices
   * are submitted, so an empty submission means "all".
   */
  readonly multiple?: boolean;
  readonly name: string;
  /** Reports the chosen value of a single choice group (radio buttons); not used with `multiple`. */
  readonly onChange?: (value: string) => void;
  readonly options: readonly ChoiceOption[];
  /**
   * Makes a single choice group controlled: the shown choice is always `value`. Without it the
   * group is uncontrolled and starts with `initial`; the form reads the result.
   */
  readonly value?: string;
}

/** Radio group (or checkbox group with `multiple`) rendered as one joined row of equally wide buttons (a single choice) or as separate buttons (several choices at once); the value is read from the surrounding form. */
export function ChoiceGroup({
  hideLegend = false,
  info,
  initial,
  legend,
  multiple = false,
  name,
  onChange,
  options,
  value: controlled,
}: ChoiceGroupProps) {
  const legendId = useId();
  const [selected, setSelected] = useState<readonly string[]>(
    typeof initial === "string" ? [initial] : initial,
  );
  const specific = options.filter((option) => option.value !== "").length;
  const hasAll = options.some((option) => option.value === "");

  function toggle(value: string) {
    setSelected((current) => {
      // Without an "all" option the choices are plain: any number can be picked, but one stays.
      if (!hasAll) {
        const next = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        return next.length === 0 ? current : next;
      }
      if (value === "") return [""];
      const picked = current.filter((item) => item !== "");
      const next = picked.includes(value)
        ? picked.filter((item) => item !== value)
        : [...picked, value];
      return next.length === 0 || next.length === specific ? [""] : next;
    });
  }

  return (
    <fieldset
      aria-labelledby={info && !hideLegend ? legendId : undefined}
      className="kit-choice-group"
    >
      {info && !hideLegend ? (
        <InfoLegend id={legendId} info={info} legend={legend} />
      ) : (
        <legend className={hideLegend ? "visually-hidden" : undefined}>{legend}</legend>
      )}
      <div
        className={`kit-choice-grid kit-choice-grid--equal${multiple ? " kit-choice-grid--separate" : ""}`}
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map(({ value, label, ariaLabel, hint, tone, info: optionInfo }) => {
          const choice = (
            <label className="kit-choice" data-tone={tone} key={value}>
              {multiple ? (
                <input
                  checked={selected.includes(value)}
                  name={value === "" ? undefined : name}
                  onChange={() => toggle(value)}
                  type="checkbox"
                  value={value}
                />
              ) : (
                <input
                  {...(controlled === undefined
                    ? { defaultChecked: value === initial }
                    : { checked: controlled === value })}
                  name={name}
                  onChange={() => onChange?.(value)}
                  type="radio"
                  value={value}
                />
              )}
              <span aria-label={ariaLabel}>
                {label}
                {hint && <small>{hint}</small>}
              </span>
            </label>
          );
          return optionInfo ? (
            <div className="kit-choice-wrap" key={value}>
              {choice}
              <InfoButton {...optionInfo} className="kit-info-button--option" />
            </div>
          ) : (
            choice
          );
        })}
      </div>
    </fieldset>
  );
}
