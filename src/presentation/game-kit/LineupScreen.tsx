import type { FormEventHandler, ReactNode } from "react";
import { Button } from "../components";
import { StartBar } from "./StartBar";

interface LineupScreenProps {
  /** Accessible name of the screen, for example "Line-up". */
  readonly ariaLabel: string;
  /** The teams and players, usually a `SetupSection` with `TeamsSetup` or `PlayersSetup`. */
  readonly children: ReactNode;
  /** A small button left of the start button, for example the icon button to the settings. */
  readonly sideAction?: ReactNode;
  /** Id of the form; the start button belongs to it. */
  readonly formId: string;
  /** Messages shown above the form, for example errors. */
  readonly messages?: ReactNode;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly startDisabled?: boolean;
  readonly startLabel: string;
}

/**
 * The line-up after "Start" in the main menu of every game: the teams and players are set here, the
 * button pinned to the bottom starts the game. Replaying a game with the same settings returns to
 * this screen with the teams filled in.
 */
export function LineupScreen({
  ariaLabel,
  children,
  formId,
  messages,
  onSubmit,
  sideAction,
  startDisabled = false,
  startLabel,
}: LineupScreenProps) {
  return (
    <section aria-label={ariaLabel} className="kit-lineup kit-onepage">
      {messages}
      <form id={formId} noValidate onSubmit={onSubmit}>
        {children}
      </form>
      <StartBar sideAction={sideAction}>
        <Button disabled={startDisabled} form={formId} type="submit" variant="success">
          {startLabel}
        </Button>
      </StartBar>
    </section>
  );
}
