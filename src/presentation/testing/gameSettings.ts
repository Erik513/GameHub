import { fireEvent, screen } from "@testing-library/react";

/** Opens the settings of a game from its line-up (the button above the tabs), in English or German. */
export function openGameSettings(): void {
  fireEvent.click(screen.getByRole("button", { name: /^(Game settings|Spieleinstellungen)$/ }));
}

/** Closes the settings with "Done" and returns to the line-up. */
export function closeGameSettings(): void {
  fireEvent.click(screen.getByRole("button", { name: /^(Done|Fertig)$/ }));
}
