import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { GeneralSettings } from "./GeneralSettings";

it.each([
  { language: "en", legend: "Narrator", beginner: "Beginner", experienced: "Experienced" },
  { language: "de", legend: "Erzähler", beginner: "Anfänger", experienced: "Erfahren" },
] as const)(
  "chooses the level of the narrator below the rules ($language)",
  async ({ language, legend, beginner, experienced }) => {
    const i18n = await createGameHubI18n(language);
    const onLevel = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <GeneralSettings
          narrator={{ level: "beginner", onChange: onLevel }}
          onChange={() => undefined}
          rules={{ attackOnFirstNight: false }}
        />
      </I18nextProvider>,
    );
    const group = screen.getByRole("group", { name: new RegExp(`^${legend}`) });
    expect(group).toHaveTextContent(beginner);
    await user.click(screen.getByRole("radio", { name: experienced }));
    expect(onLevel).toHaveBeenCalledWith("experienced");
  },
);
