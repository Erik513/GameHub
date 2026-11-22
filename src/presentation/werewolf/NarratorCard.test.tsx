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

  it("shows a 2 on both spells while both are there, and German texts", async () => {
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

  it("shows no 2 when only one spell is left, on neither of the two buttons", async () => {
    const one: Card = {
      abilities: [
        { available: true, count: 1, id: "heal", symbol: "heal" },
        { available: true, count: 1, id: "kill", symbol: "kill" },
      ],
      actors: ["Ben"],
      cover: false,
      effects: [],
      role: "magician",
    };
    const { container } = await inLanguage("en", <NarratorCard card={one} />);
    expect(container.querySelector(".ww-ability__count")).toBeNull();
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

  it("switches off every ability once the narrator has decided", async () => {
    const onAbility = vi.fn();
    await inLanguage("en", <NarratorCard card={witch} locked onAbility={onAbility} />);
    const heal = screen.getByRole("button", { name: /^Heal/ });
    expect(heal).toBeDisabled();
    fireEvent.click(heal);
    expect(onAbility).not.toHaveBeenCalled();
  });

  it("shows the day without a role: no head and no slots, only the vote button", async () => {
    const day: Card = {
      abilities: [{ available: true, id: "vote", symbol: "vote" }],
      actors: [],
      cover: false,
      effects: [],
      role: "day",
    };
    const { container } = await inLanguage("en", <NarratorCard card={day} />);
    expect(container.querySelector(".ww-role-card__head")).toBeNull();
    expect(container.querySelectorAll(".ww-role-card__slot")).toHaveLength(0);
    expect(screen.getByRole("button", { name: /Vote/ })).toBeTruthy();
  });

  it("names only the nominated person at the vote, without a role symbol", async () => {
    const vote: Card = {
      abilities: [],
      actors: ["Anna"],
      cover: false,
      effects: ["amulet"],
      role: "day",
    };
    const { container } = await inLanguage("en", <NarratorCard card={vote} />);
    expect(screen.getByText("Anna")).toBeTruthy();
    expect(container.querySelector(".ww-role-card__role")).toBeNull();
    expect(container.querySelectorAll(".ww-role-card__slot")).toHaveLength(3);
  });

  it('shows the vote button together with a button "no vote" at the bottom of the day box', async () => {
    const day: Card = {
      abilities: [{ available: true, id: "vote", symbol: "vote" }],
      actors: [],
      cover: false,
      effects: [],
      role: "day",
    };
    const onSkip = vi.fn();
    await inLanguage(
      "en",
      <NarratorCard
        card={day}
        skip={{ disabled: false, framed: true, label: "No vote", onSkip }}
      />,
    );
    const noVote = screen.getByRole("button", { name: "No vote" });
    expect(noVote).toHaveAttribute("data-next");
    fireEvent.click(noVote);
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("dims the abilities once the narrator has decided (not struck through), and shows them as ready again afterwards", async () => {
    const { container, rerender } = await inLanguage("en", <NarratorCard card={witch} locked />);
    for (const button of container.querySelectorAll(".ww-ability"))
      expect(button.getAttribute("data-state")).toBe("dim");
    rerender(<NarratorCard card={witch} />);
    expect(container.querySelector(".ww-ability")?.getAttribute("data-state")).toBe("ready");
  });

  it("takes the 2 away from both spells once one of them is chosen, and shows the other still usable", async () => {
    const two: Card = {
      abilities: [
        { available: true, count: 2, id: "heal", symbol: "heal" },
        { available: true, count: 2, id: "kill", symbol: "kill" },
      ],
      actors: ["Ben"],
      cover: false,
      effects: [],
      role: "magician",
    };
    const { container, rerender } = await inLanguage("en", <NarratorCard card={two} />);
    expect(container.querySelectorAll(".ww-ability__count")).toHaveLength(2);
    rerender(<NarratorCard card={two} pressed={["heal"]} spellsUsed={1} />);
    expect(container.querySelector(".ww-ability__count")).toBeNull();
    // The other spell can still be used; with both gone the unchosen one looks used up.
    const kill = [...container.querySelectorAll(".ww-ability")][1]!;
    expect(kill.getAttribute("data-state")).toBe("ready");
    rerender(<NarratorCard card={two} pressed={["kill"]} spellsUsed={2} />);
    const heal = [...container.querySelectorAll(".ww-ability")][0]!;
    expect(heal.getAttribute("data-state")).toBe("used");
    expect(heal).toBeDisabled();
  });
});
