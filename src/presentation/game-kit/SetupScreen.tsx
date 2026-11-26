import type { FormEventHandler, ReactNode, Ref } from "react";
import { Button } from "../components";
import { StartBar } from "./StartBar";

interface SetupScreenProps {
  /** The sections of the setup, usually `SetupSection`s. */
  readonly children: ReactNode;
  /** Lets the game read the values of the form at any time, for example when the game starts. */
  readonly formRef?: Ref<HTMLFormElement>;
  /** Id of the form; the start button belongs to it. */
  readonly formId: string;
  /** Messages shown above the form, for example errors. */
  readonly messages?: ReactNode;
  readonly onChange?: FormEventHandler<HTMLFormElement>;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly startDisabled?: boolean;
  readonly startLabel: string;
  /** The blue button left of the main button (the same place in every game, for example the wake-up order). */
  readonly sideAction?: ReactNode;
  /** The name of the screen for screen readers; with it the screen is a named region. */
  readonly label?: string;
  /** Extra classes of the screen (the game's own styles). */
  readonly className?: string;
  /** The screen itself, for example to put the focus on it when it opens. */
  readonly rootRef?: Ref<HTMLElement>;
}

/**
 * The settings frame of every game: messages, the form with its sections and the main button pinned to the bottom,
 * with an optional button left of it. The rules button belongs in the game settings section, the button to the
 * editor in the section of the game's own content; the game puts them there.
 */
export function SetupScreen({
  children,
  formId,
  formRef,
  messages,
  onChange,
  onSubmit,
  startDisabled = false,
  startLabel,
  sideAction,
  label,
  className,
  rootRef,
}: SetupScreenProps) {
  return (
    <section
      {...(label === undefined ? {} : { "aria-label": label })}
      className={className ? `kit-onepage ${className}` : "kit-onepage"}
      ref={rootRef}
      {...(rootRef ? { tabIndex: -1 } : {})}
    >
      {messages}
      <form id={formId} noValidate onChange={onChange} onSubmit={onSubmit} ref={formRef}>
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
