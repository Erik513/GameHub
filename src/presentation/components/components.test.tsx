import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { Card } from "./Card";
import { Dialog } from "./Dialog";
import { EmptyState } from "./EmptyState";
import { StatusMessage } from "./StatusMessage";
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

  it("announces loading and success feedback without interrupting the user", () => {
    const { rerender } = render(
      <StatusMessage busy title="Loading games">
        The library is being refreshed.
      </StatusMessage>,
    );

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");

    rerender(
      <StatusMessage title="Games loaded" tone="success">
        The library is ready.
      </StatusMessage>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Games loadedThe library is ready.");
  });

  it("announces errors while preserving entered data", async () => {
    const user = userEvent.setup();
    render(
      <>
        <TextField label="Team name" />
        <StatusMessage title="Could not save" tone="error">
          Try again.
        </StatusMessage>
      </>,
    );

    const input = screen.getByRole("textbox", { name: "Team name" });
    await user.type(input, "Night Owls");

    expect(screen.getByRole("alert")).toHaveTextContent("Could not saveTry again.");
    expect(input).toHaveValue("Night Owls");
  });

  it("renders an empty state with an optional recovery action", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <EmptyState
        action={<Button onClick={onClick}>Refresh</Button>}
        description="No games found"
        title="Empty"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<EmptyState description="No games found" title="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
