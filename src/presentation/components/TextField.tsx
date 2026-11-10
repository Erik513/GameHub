import { useId, type InputHTMLAttributes } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "aria-describedby"> {
  error?: string;
  hint?: string;
  label: string;
}

export function TextField({ error, hint, id, label, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const description = error ?? hint;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className="field__input"
        id={inputId}
        {...props}
      />
      {description ? (
        <span
          className={error ? "field__message field__message--error" : "field__message"}
          id={descriptionId}
        >
          {description}
        </span>
      ) : null}
    </div>
  );
}
