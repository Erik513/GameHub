import type { FormEventHandler, ReactNode } from "react";
import { Button } from "../components";
import { StartBar } from "./StartBar";

interface SetupScreenProps {
  /** The sections of the setup, usually `SetupSection`s. */
  readonly children: ReactNode;
  /** Id of the form; the start button belongs to it. */
  readonly formId: string;
  /** Messages shown above the form, for example errors. */
  readonly messages?: ReactNode;
  readonly onChange?: FormEventHandler<HTMLFormElement>;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly startDisabled?: boolean;
  readonly startLabel: string;
}

/**
 * The main menu frame of every game: messages, the form with its sections and the start button
 * pinned to the bottom. The rules button belongs in the game settings section, the button to the
 * editor in the section of the game's own content; the game puts them there.
 */
export function SetupScreen({
  children,
  formId,
  messages,
  onChange,
  onSubmit,
  startDisabled = false,
  startLabel,
}: SetupScreenProps) {
  return (
    <div className="kit-onepage">
      {messages}
      <form id={formId} noValidate onChange={onChange} onSubmit={onSubmit}>
        {children}
      </form>
      <StartBar>
        <Button disabled={startDisabled} form={formId} type="submit" variant="success">
          {startLabel}
        </Button>
      </StartBar>
    </div>
  );
}
