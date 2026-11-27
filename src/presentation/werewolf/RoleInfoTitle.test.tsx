import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { ConfigInfo } from "./ConfigInfo";
import { RoleCardInfo } from "./RoleCardInfo";

/** The heading of the open window: what stands in it, in order (the symbol, then the name, then the rest). */
function titleParts() {
  const heading = screen.getByRole("dialog").querySelector(".dialog__title")!;
  return [...heading.children].map((child) =>
    child.tagName === "H2" ? `name:${child.textContent}` : child.getAttribute("data-symbol"),
  );
}

it.each(["en", "de"] as const)(
  "puts the symbol of the role before its name in the info of the configuration (%s)",
  async (language) => {
    const i18n = await createGameHubI18n(language);
    render(
      <I18nextProvider i18n={i18n}>
        <ConfigInfo id="witch" minimum={8} name="Hexe" onOpenChange={() => undefined} open />
      </I18nextProvider>,
    );
    const parts = titleParts();
    expect(parts[0]).toBe("witch");
    expect(parts[1]).toBe("name:Hexe");
    // The box "from 8 players" follows the name.
    expect(parts).toHaveLength(3);
  },
);

it("puts the symbol of the role before its name in the info of the card", async () => {
  const i18n = await createGameHubI18n("en");
  const user = userEvent.setup();
  render(
    <I18nextProvider i18n={i18n}>
      <RoleCardInfo amulet={false} role="seer" variant={null} />
    </I18nextProvider>,
  );
  await user.click(screen.getByRole("button"));
  expect(titleParts()).toEqual(["seer", "name:Seer"]);
});
