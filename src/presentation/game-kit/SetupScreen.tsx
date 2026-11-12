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
  /** Buttons at the top right, for example the rules of the game. */
  readonly toolbar?: ReactNode;
}

/**
 * The frame of the setup screen of every game: messages, a toolbar at the top right, the form with
 * its sections and the start button pinned to the bottom. The game fills in its own sections.
 */
export function SetupScreen({
  children,
  formId,
  messages,
  onChange,
  onSubmit,
  startDisabled = false,
  startLabel,
  toolbar,
}: SetupScreenProps) {
  return (
    <>
      {messages}
      {toolbar && <div className="kit-setup-toolbar">{toolbar}</div>}
      <form id={formId} noValidate onChange={onChange} onSubmit={onSubmit}>
        {children}
      </form>
      <StartBar>
        <Button disabled={startDisabled} form={formId} type="submit" variant="success">
          {startLabel}
        </Button>
      </StartBar>
    </>
  );
}
