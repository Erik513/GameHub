import { InfoButton, type InfoContent } from "./InfoButton";

export interface ChoiceOption {
  readonly value: string;
  readonly label: string;
  /** Accessible name when the visible label is only a symbol. */
  readonly ariaLabel?: string;
  /** Small secondary text below the label. */
  readonly hint?: string;
  /** Colors the option, for example by difficulty. */
  readonly tone?: "easy" | "medium" | "hard";
}

interface ChoiceGroupProps {
  /** Adds an info button next to the legend that explains the setting. */
  readonly info?: InfoContent;
  readonly initial: string;
  readonly legend: string;
  readonly name: string;
  readonly options: readonly ChoiceOption[];
}

/** Radio group rendered as equally wide buttons; the value is read from the surrounding form. */
export function ChoiceGroup({ info, initial, legend, name, options }: ChoiceGroupProps) {
  return (
    <fieldset className={info ? "kit-choice-group kit-choice-group--info" : "kit-choice-group"}>
      <legend>{legend}</legend>
      {info && <InfoButton {...info} />}
      <div
        className="kit-choice-grid kit-choice-grid--equal"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map(({ value, label, ariaLabel, hint, tone }) => (
          <label className="kit-choice" data-tone={tone} key={value}>
            <input type="radio" name={name} value={value} defaultChecked={value === initial} />
            <span aria-label={ariaLabel}>
              {label}
              {hint && <small>{hint}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
