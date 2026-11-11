import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChoiceGroup } from "./ChoiceGroup";
import { InfoButton } from "./InfoButton";

const content = {
  closeLabel: "Close",
  label: "Info about rounds",
  text: "A round is over when every team has played once.",
  title: "Rounds per team",
};

describe("InfoButton", () => {
  it("opens an explanation dialog and closes it again", () => {
    render(<InfoButton {...content} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Info about rounds" }));
    const dialog = screen.getByRole("dialog", { name: "Rounds per team" });
    expect(within(dialog).getByText(content.text)).toBeVisible();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes with the Escape key", () => {
    render(<InfoButton {...content} />);
    fireEvent.click(screen.getByRole("button", { name: "Info about rounds" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("never submits a surrounding form", () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ChoiceGroup
          info={content}
          initial="3"
          legend="Rounds per team"
          name="rounds"
          options={[{ value: "3", label: "3" }]}
        />
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Info about rounds" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onSubmit).not.toHaveBeenCalled();
    // The group keeps its plain name even though it contains an info button.
    expect(screen.getByRole("group", { name: "Rounds per team" })).toBeVisible();
  });
});
