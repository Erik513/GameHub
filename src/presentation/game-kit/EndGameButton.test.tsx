import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { EndGameButton } from "./EndGameButton";

async function renderButton(language: "en" | "de", compact: boolean) {
  const i18n = await createGameHubI18n(language);
  const onConfirm = vi.fn();
  render(
    <I18nextProvider i18n={i18n}>
      <EndGameButton compact={compact} onConfirm={onConfirm} />
    </I18nextProvider>,
  );
  return { onConfirm, user: userEvent.setup() };
}

it.each([
  { language: "en", idle: "End game", armed: "Tap again to end", ask: "End?" },
  { language: "de", idle: "Spiel beenden", armed: "Nochmal tippen zum Beenden", ask: "Beenden?" },
] as const)(
  "asks with the same short word in every game and ends with the second tap, in $language",
  async ({ language, idle, armed, ask }) => {
    for (const compact of [true, false]) {
      document.body.innerHTML = "";
      const { onConfirm, user } = await renderButton(language, compact);
      await user.click(screen.getByRole("button", { name: idle }));
      expect(onConfirm).not.toHaveBeenCalled();
      const button = screen.getByRole("button", { name: armed });
      expect(button).toHaveTextContent(ask);
      // A tap right after the first one is ignored (double tap), the next one ends the game.
      await new Promise((resolve) => setTimeout(resolve, 450));
      await user.click(button);
      expect(onConfirm).toHaveBeenCalledTimes(1);
    }
  },
);
