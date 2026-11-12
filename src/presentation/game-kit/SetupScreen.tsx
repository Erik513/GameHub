import type { FormEventHandler, ReactNode } from "react";
import { Button } from "../components";
import { PlayerRosterButton } from "./PlayerRosterButton";
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
  /** The button that explains the rules of the game; every game has one. */
  readonly rules: ReactNode;
  /** The button to the editor of the game's own content; only games with own content have one. */
  readonly editor?: ReactNode;
}

/**
 * The main menu frame of every game: messages, the buttons for the rules and the optional editor
 * at the top right, the form with its sections and the start button pinned to the bottom. The
 * game fills in its own sections.
 */
export function SetupScreen({
  children,
  formId,
  messages,
  onChange,
  onSubmit,
  startDisabled = false,
  startLabel,
  editor,
  rules,
}: SetupScreenProps) {
  return (
    <>
      {messages}
      <div className="kit-setup-toolbar">
        <PlayerRosterButton />
        {editor}
        {rules}
      </div>
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
