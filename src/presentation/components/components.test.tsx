import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { Card } from "./Card";
import { Dialog } from "./Dialog";
import { TextField } from "./TextField";

describe("presentation components", () => {
  it("supports button activation and disabled states", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Start</Button>);

    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<Button disabled>Start</Button>);
    expect(screen.getByRole("button", { name: "Start" })).toBeDisabled();
  });

  it("supports secondary button styling", () => {
    render(
      <Button className="custom-action" variant="secondary">
        Continue
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Continue" })).toHaveClass(
      "button--secondary",
      "custom-action",
    );
  });

  it("connects text field labels, hints and errors", () => {
    const { rerender } = render(<TextField label="Team name" hint="At least two characters" />);
    const input = screen.getByRole("textbox", { name: "Team name" });

    expect(input).toHaveAccessibleDescription("At least two characters");

    rerender(<TextField label="Team name" error="Required" />);
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Required");
  });

  it("renders a text field without an optional description", () => {
    render(<TextField label="Player" />);

    expect(screen.getByRole("textbox", { name: "Player" })).not.toHaveAttribute("aria-describedby");
  });

  it("renders semantic card content", () => {
    render(<Card aria-label="Game preview">Taboo</Card>);
    expect(screen.getByRole("region", { name: "Game preview" })).toHaveTextContent("Taboo");
  });

  it("focuses and closes an open dialog with Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog closeLabel="Close" onClose={onClose} open title="Settings">
        Dialog content
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders nothing while a dialog is closed", () => {
    render(
      <Dialog closeLabel="Close" onClose={vi.fn()} open={false} title="Settings">
        Dialog content
      </Dialog>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("describes a dialog and closes it from the backdrop", () => {
    const onClose = vi.fn();

    render(
      <Dialog
        closeLabel="Close"
        description="Change shared preferences"
        onClose={onClose}
        open
        title="Settings"
      >
        Dialog content
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "Settings" })).toHaveAccessibleDescription(
      "Change shared preferences",
    );
    fireEvent.mouseDown(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
