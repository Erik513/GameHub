import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { DealCard } from "./DealCard";
import type { RoleVariant } from "./roleAbilities";

async function renderCard(language: "en" | "de", variant: RoleVariant | null) {
  const i18n = await createGameHubI18n(language);
  const user = userEvent.setup();
  render(
    <I18nextProvider i18n={i18n}>
      <DealCard
        amulet={false}
        mayor="doubleVote"
        name="Anna"
        position={2}
        role="hunter"
        total={20}
        variant={variant}
      />
    </I18nextProvider>,
  );
  return user;
}

describe("DealCard", () => {
  it.each([
    { language: "de", required: "Schusspflicht", optional: "Keine Schusspflicht" },
    { language: "en", required: "Duty to shoot", optional: "No duty to shoot" },
  ] as const)(
    "names how the role is played, in $language",
    async ({ language, optional, required }) => {
      for (const [variant, text] of [
        ["required", required],
        ["optional", optional],
      ] as const) {
        const user = await renderCard(language, variant);
        expect(screen.queryByText(text)).toBeNull();
        await user.click(screen.getByRole("button", { pressed: false }));
        expect(screen.getByText(text)).toBeInTheDocument();
        document.body.innerHTML = "";
      }
    },
  );

  it("shows no label for a role without options", async () => {
    const user = await renderCard("en", null);
    await user.click(screen.getByRole("button", { pressed: false }));
    expect(document.querySelector(".ww-deal__variant")).toBeNull();
  });

  it.each([
    {
      language: "de",
      info: /Info zu Jäger/,
      shoot: "Wenn du ausscheidest, schießt du auf eine lebende Person.",
      duty: "Du musst schießen.",
    },
    {
      language: "en",
      info: /Info about Hunter/i,
      shoot: "When you leave the game, you shoot at a living person.",
      duty: "You have to shoot.",
    },
  ] as const)(
    "explains the role in a few sentences for the player in $language",
    async ({ duty, info, language, shoot }) => {
      const user = await renderCard(language, "required");
      await user.click(screen.getByRole("button", { pressed: false }));
      await user.click(screen.getByRole("button", { name: info }));
      const dialog = await screen.findByRole("dialog");
      expect(dialog).toHaveTextContent(shoot);
      expect(dialog).toHaveTextContent(duty);
      // Nothing about the setup of the game.
      expect(dialog.textContent).not.toMatch(
        /Konfiguration|Empfehlung|configuration|recommendation|Wähle, wie viele|how many/i,
      );
    },
  );
});
