import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ChoiceGroup } from "./ChoiceGroup";

const options = [
  { value: "", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

function renderGroup() {
  render(
    <form aria-label="settings">
      <ChoiceGroup initial="" legend="Difficulty" multiple name="difficulty" options={options} />
    </form>,
  );
  const box = (name: string) => screen.getByRole("checkbox", { name });
  const submitted = () =>
    new FormData(screen.getByRole<HTMLFormElement>("form", { name: "settings" })).getAll(
      "difficulty",
    );
  return { box, submitted };
}

it("lets several choices be picked and lets All exclude them", () => {
  const { box, submitted } = renderGroup();
  expect(box("All")).toBeChecked();
  expect(submitted()).toEqual([]);

  fireEvent.click(box("Easy"));
  expect(box("All")).not.toBeChecked();
  fireEvent.click(box("Hard"));
  expect(box("Easy")).toBeChecked();
  expect(box("Hard")).toBeChecked();
  expect(submitted()).toEqual(["easy", "hard"]);

  fireEvent.click(box("All"));
  expect(box("All")).toBeChecked();
  expect(box("Easy")).not.toBeChecked();
  expect(box("Hard")).not.toBeChecked();
  expect(submitted()).toEqual([]);
});

it("falls back to All when the last choice is removed or every choice is picked", () => {
  const { box } = renderGroup();
  fireEvent.click(box("Medium"));
  fireEvent.click(box("Medium"));
  expect(box("All")).toBeChecked();
  expect(box("Medium")).not.toBeChecked();

  fireEvent.click(box("Easy"));
  fireEvent.click(box("Medium"));
  fireEvent.click(box("Hard"));
  expect(box("All")).toBeChecked();
  expect(box("Easy")).not.toBeChecked();

  fireEvent.click(box("All"));
  expect(box("All")).toBeChecked();
});

it("lets any number of choices be picked without an all option, but keeps one", () => {
  render(
    <form aria-label="settings">
      <ChoiceGroup
        initial={["easy", "medium", "hard"]}
        legend="Difficulty"
        multiple
        name="difficulty"
        options={options.slice(1)}
      />
    </form>,
  );
  const submitted = () =>
    new FormData(screen.getByRole<HTMLFormElement>("form", { name: "settings" })).getAll(
      "difficulty",
    );
  expect(submitted()).toEqual(["easy", "medium", "hard"]);
  fireEvent.click(screen.getByRole("checkbox", { name: "Easy" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Medium" }));
  expect(submitted()).toEqual(["hard"]);
  // The last choice cannot be switched off.
  fireEvent.click(screen.getByRole("checkbox", { name: "Hard" }));
  expect(submitted()).toEqual(["hard"]);
  fireEvent.click(screen.getByRole("checkbox", { name: "Easy" }));
  expect(submitted()).toEqual(["easy", "hard"]);
});

it("opens the info from the info button next to the heading and from the heading text", () => {
  render(
    <form>
      <ChoiceGroup
        info={{
          closeLabel: "Close",
          label: "Info about Skips",
          text: "How often.",
          title: "Skips",
        }}
        initial="1"
        legend="Skips"
        name="skips"
        options={[
          { value: "0", label: "None" },
          { value: "1", label: "1" },
        ]}
      />
    </form>,
  );
  // The group is named by its heading text only, not by the info button.
  const group = screen.getByRole("group", { name: "Skips" });
  expect(group).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Info about Skips" }));
  expect(screen.getByRole("dialog", { name: "Skips" })).toHaveTextContent("How often.");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  // A tap on the heading text opens the same window.
  fireEvent.click(screen.getByRole("button", { name: "Skips" }));
  expect(screen.getByRole("dialog", { name: "Skips" })).toBeVisible();
});

it("shows a plain heading with its buttons when a group has no info", () => {
  render(
    <form>
      <ChoiceGroup
        initial="a"
        legend="Mode"
        name="mode"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
      />
    </form>,
  );
  expect(screen.getByRole("group", { name: "Mode" })).toBeVisible();
  expect(screen.queryByRole("button", { name: /Info/ })).not.toBeInTheDocument();
});
