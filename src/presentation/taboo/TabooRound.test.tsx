import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { TabooSetup } from "./TabooSetup";

it("plays cards without resetting the countdown and ends the round on time", async () => {
  const i18n = await createGameHubI18n("en");
  vi.useFakeTimers();
  try {
    render(
      <I18nextProvider i18n={i18n}>
        <TabooSetup cardLanguage="en" />
      </I18nextProvider>,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Team 1" }), {
      target: { value: "Owls" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Team 2" }), {
      target: { value: "Foxes" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Prepare game" }));
    fireEvent.click(screen.getByRole("button", { name: "Start round" }));
    const round = screen.getByRole("region", { name: "Active round" });
    expect(within(round).getAllByRole("listitem")).toHaveLength(3);
    expect(within(round).getByRole("timer")).toHaveTextContent("60 seconds left");
    expect(round).toHaveTextContent("Team: Owls");
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    const firstTerm = within(round).getByRole("heading").textContent;
    fireEvent.click(within(round).getByRole("button", { name: "Correct" }));
    expect(within(round).getByRole("heading").textContent).not.toBe(firstTerm);
    fireEvent.click(within(round).getByRole("button", { name: "Skip" }));
    fireEvent.click(within(round).getByRole("button", { name: "Forbidden word" }));
    expect(round).toHaveTextContent("Score: 1");
    expect(within(round).getByRole("timer")).toHaveTextContent("59 seconds left");
    void act(() => {
      vi.advanceTimersByTime(59000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Round ended");
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    void act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Score: 1");
  } finally {
    vi.useRealTimers();
  }
});
