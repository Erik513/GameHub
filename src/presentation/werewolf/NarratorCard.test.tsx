import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import type { NarratorCard as Card } from "../../business/games/werewolf/narratorCard";
import { I18nextProvider } from "react-i18next";
import { createGameHubI18n } from "../../i18n";
import { NarratorCard } from "./NarratorCard";

const witch: Card = {
  abilities: [
    { available: true, id: "heal", symbol: "heal" },
    { available: false, id: "poison", symbol: "kill" },
  ],
  actors: ["Anna"],
  cover: false,
  effects: ["amulet", "lovers"],
  role: "witch",
};

async function inLanguage(language: "en" | "de", element: ReactElement) {
  const i18n = await createGameHubI18n(language);
  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

describe("NarratorCard", () => {
  it("shows the role, the awake person, three slots and the abilities", async () => {
    const { container } = await inLanguage("en", <NarratorCard card={witch} />);
    expect(screen.getByText("Witch")).toBeTruthy();
    expect(screen.getByText("Anna")).toBeTruthy();
    expect(container.querySelectorAll(".ww-role-card__slot")).toHaveLength(3);
    expect(container.querySelectorAll('.ww-role-card__slot[data-empty="true"]')).toHaveLength(1);
    expect(screen.getByLabelText("Protective amulet")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Heal: ready" })).toHaveProperty("disabled", false);
    expect(screen.getByRole("button", { name: "Poison: not possible" })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("calls back only for an ability that can be used and marks the open one", async () => {
    const onAbility = vi.fn();
    await inLanguage("en", <NarratorCard pressed={["heal"]} card={witch} onAbility={onAbility} />);
    fireEvent.click(screen.getByRole("button", { name: "Heal: ready" }));
    fireEvent.click(screen.getByRole("button", { name: "Poison: not possible" }));
    expect(onAbility).toHaveBeenCalledTimes(1);
    expect(onAbility).toHaveBeenCalledWith("heal");
    expect(screen.getByRole("button", { name: "Heal: ready" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("shows the counter of the magician on both spells, and German texts", async () => {
    const magician: Card = {
      abilities: [
        { available: true, count: 2, id: "heal", symbol: "heal" },
        { available: true, count: 2, id: "kill", symbol: "kill" },
      ],
      actors: ["Ben"],
      cover: false,
      effects: [],
      role: "magician",
    };
    const { container } = await inLanguage("de", <NarratorCard card={magician} />);
    expect(screen.getByText("Magier")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Heilen: bereit" })).toBeTruthy();
    expect([...container.querySelectorAll(".ww-ability__count")].map((c) => c.textContent)).toEqual(
      ["2", "2"],
    );
  });

  it("shows a cover call without a name and without buttons for a role without abilities", async () => {
    const cover: Card = { ...witch, actors: [], cover: true };
    const { container } = await inLanguage("en", <NarratorCard card={cover} />);
    expect(container.querySelector("small")).toBeNull();
    expect(container.querySelector(".ww-role-card__abilities")).not.toBeNull();
    const plain = await inLanguage("en", <NarratorCard card={{ ...witch, abilities: [] }} />);
    expect(plain.container.querySelector(".ww-role-card__abilities")).toBeNull();
  });

  it('has a button "skip" in the card for a role that may do nothing, with the frame when the step can be left', async () => {
    const onSkip = vi.fn();
    await inLanguage(
      "en",
      <NarratorCard card={witch} skip={{ disabled: false, framed: true, onSkip }} />,
    );
    const skip = screen.getByRole("button", { name: "Skip" });
    expect(skip).toHaveAttribute("data-next");
    fireEvent.click(skip);
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it('has no button "skip" for a role that has to decide', async () => {
    await inLanguage("en", <NarratorCard card={witch} />);
    expect(screen.queryByRole("button", { name: "Skip" })).toBeNull();
  });

  it('keeps the button "skip" in place but switched off when it does not apply', async () => {
    const onSkip = vi.fn();
    await inLanguage(
      "en",
      <NarratorCard card={witch} skip={{ disabled: true, framed: false, onSkip }} />,
    );
    const skip = screen.getByRole("button", { name: "Skip" });
    expect(skip).toBeDisabled();
    expect(skip).not.toHaveAttribute("data-next");
    fireEvent.click(skip);
    expect(onSkip).not.toHaveBeenCalled();
  });
});
