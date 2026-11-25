import { useTranslation } from "react-i18next";
import { fixedAddons, fixedItems } from "../../business/games/werewolf/fixedConfiguration";
import { Dialog } from "../components";
import { RulesSection, SetupTabs } from "../game-kit";
import { ConfigInfoParts, type ConfigInfoId } from "./ConfigInfo";
import { teamOf } from "./roleTeam";
import { abilityLegend, legendHidden, symbolGroups, symbols } from "./symbols/catalog";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";
import { slotStyle } from "./symbols/stateLook";
import { stateIds } from "../../business/games/werewolf/roles/stateIds";
import type { CardEffect } from "../../business/games/werewolf/narratorCard";
import { symbolOfInfo } from "./infoSymbol";

/** Whether a symbol is a state of a person (drawn in its colored slot). */
const isState = (id: string): id is CardEffect => (stateIds as readonly string[]).includes(id);

interface WerewolfRulesDialogProps {
  onClose: () => void;
  open: boolean;
}

/** The lines of a text (one line per entry in the translation). */
const linesOf = (text: string): readonly string[] => text.split("\n").filter((line) => line !== "");

/** A list where an entry may start with a bold lead ("Name: explanation"). */
function Lines({
  lead = false,
  lines,
  ordered = false,
}: {
  /** True when the part before the first colon is the lead of the entry. */
  readonly lead?: boolean;
  readonly lines: readonly string[];
  readonly ordered?: boolean;
}) {
  const entries = lines.map((line) => {
    const colon = lead ? line.indexOf(": ") : -1;
    return (
      <li key={line}>
        {colon < 0 ? (
          line
        ) : (
          <>
            <strong>{line.slice(0, colon)}</strong>
            {line.slice(colon)}
          </>
        )}
      </li>
    );
  });
  return ordered ? (
    <ol className="kit-rules-steps">{entries}</ol>
  ) : (
    <ul className="kit-rules-list">{entries}</ul>
  );
}

/**
 * The rules of Werewolf in one window with three tabs: the game (goal, preparation, night, morning, day, who wins),
 * the roles (every role with its tasks, in the order of the minimum number of players) and the extras with the
 * settings. The explanation of a role is the same text as in the "i" window of the configuration.
 */
export function WerewolfRulesDialog({ onClose, open }: WerewolfRulesDialogProps) {
  const { t } = useTranslation();

  const role = (id: ConfigInfoId, name: string, minimum?: number) => (
    <section aria-label={name} className="ww-rules-role" key={id}>
      <h4>
        <WerewolfSymbol id={symbolOfInfo(id)} size={22} /> <span>{name}</span>{" "}
        <small className="ww-rules-role__team">({teamOf(id, t)})</small>
      </h4>
      {minimum !== undefined && (
        <p className="ww-rules-role__meta">
          {t("werewolfConfig.availableFrom", { count: minimum })}
        </p>
      )}
      <ConfigInfoParts id={id} />
    </section>
  );

  const game = (
    <>
      <RulesSection title={t("werewolfRules.game.goalTitle")}>
        <p>{t("werewolfRules.game.goal")}</p>
        <Lines lead lines={linesOf(t("werewolfRules.game.teams"))} />
      </RulesSection>
      <RulesSection title={t("werewolfRules.game.prepTitle")}>
        <Lines lines={linesOf(t("werewolfRules.game.prepSteps"))} ordered />
      </RulesSection>
      <RulesSection title={t("werewolfRules.game.nightTitle")}>
        <Lines lines={linesOf(t("werewolfRules.game.nightSteps"))} ordered />
        <p>{t("werewolfRules.game.nightHint", { button: t("werewolfConfig.wake.open") })}</p>
      </RulesSection>
      <RulesSection title={t("werewolfRules.game.morningTitle")}>
        <Lines lines={linesOf(t("werewolfRules.game.morning"))} />
      </RulesSection>
      <RulesSection title={t("werewolfRules.game.dayTitle")}>
        <Lines lines={linesOf(t("werewolfRules.game.daySteps"))} ordered />
      </RulesSection>
      <RulesSection title={t("werewolfRules.game.winTitle")}>
        <Lines lines={linesOf(t("werewolfRules.game.win"))} />
      </RulesSection>
    </>
  );

  // The special roles in the order of the minimum number of players, as in the configuration.
  const specialRoles = [...fixedItems].sort((a, b) => a.minimum - b.minimum);
  const roles = (
    <>
      <p className="kit-rules-intro">{t("werewolfRules.roles.intro")}</p>
      <RulesSection title={t("werewolfRules.roles.coreTitle")}>
        {role("wolves", t("werewolfConfig.wolves"))}
        {role("seer", t("werewolfConfig.seer"))}
        {role("villagers", t("werewolfConfig.villagers"))}
      </RulesSection>
      <RulesSection title={t("werewolfRules.roles.specialTitle")}>
        {specialRoles.map((item) =>
          role(item.id, t(`werewolfConfig.items.${item.id}`), item.minimum),
        )}
      </RulesSection>
    </>
  );

  const extras = (
    <>
      <RulesSection title={t("werewolfRules.extras.addonsTitle")}>
        <p>{t("werewolfRules.extras.addonsIntro")}</p>
        {fixedAddons.map((addon) =>
          role(addon.id, t(`werewolfConfig.addons.${addon.id}`), addon.minimum),
        )}
      </RulesSection>
      <RulesSection title={t("werewolfRules.extras.settingsTitle")}>
        <Lines lead lines={linesOf(t("werewolfRules.extras.settings"))} />
      </RulesSection>
      <RulesSection title={t("werewolfRules.extras.fixedTitle")}>
        <Lines lines={linesOf(t("werewolfRules.extras.fixed"))} />
      </RulesSection>
      <RulesSection title={t("werewolfRules.extras.variableTitle")}>
        <Lines lead lines={linesOf(t("werewolfRules.extras.variable"))} />
      </RulesSection>
      <RulesSection title={t("werewolfRules.extras.toolsTitle")}>
        <Lines lead lines={linesOf(t("werewolfRules.extras.tools"))} />
      </RulesSection>
    </>
  );

  // The legend: every symbol with its name and what it says, by group.
  const legend = (
    <>
      <p className="kit-rules-intro">{t("werewolfSymbols.intro")}</p>
      {/* The old group of the means of a role is gone: the abilities have their own part below (in a circle). */}
      {symbolGroups
        .filter((group) => group !== "resource")
        .map((group) => (
          <RulesSection key={group} title={t(`werewolfSymbols.groups.${group}`)}>
            <ul className="ww-legend">
              {symbols
                .filter((entry) => entry.group === group && !legendHidden.has(entry.id))
                .map((entry) => (
                  <li className="ww-legend__item" key={entry.id}>
                    {/* A state is drawn as in the game: in its colored slot. */}
                    {isState(entry.id) ? (
                      <span className="ww-slot ww-legend__slot" style={slotStyle(entry.id)}>
                        <WerewolfSymbol id={entry.id} size={20} />
                      </span>
                    ) : (
                      <WerewolfSymbol id={entry.id} size={28} />
                    )}
                    <span>
                      <strong>{t(`werewolfSymbols.items.${entry.id}.name`)}</strong>
                      <small>{t(`werewolfSymbols.items.${entry.id}.meaning`)}</small>
                    </span>
                  </li>
                ))}
            </ul>
          </RulesSection>
        ))}
      {/* The abilities: the same drawings as the states, but in a circle (as in the narrator view). */}
      <RulesSection title={t("werewolfSymbols.abilities.title")}>
        <ul className="ww-legend">
          {abilityLegend.map((entry) => (
            <li className="ww-legend__item" key={entry.ability}>
              <WerewolfSymbol id={entry.symbol} ring size={28} />
              <span>
                <strong>{t(`werewolfNarrator.ability.${entry.ability}`)}</strong>
                <small>{t(`werewolfSymbols.abilities.items.${entry.ability}`)}</small>
              </span>
            </li>
          ))}
        </ul>
      </RulesSection>
      <p className="ww-legend__credits">{t("werewolfSymbols.credits")}</p>
    </>
  );

  return (
    <Dialog
      closeLabel={t("werewolfConfig.infoClose")}
      onClose={onClose}
      open={open}
      size="large"
      title={t("werewolfRules.title")}
    >
      {/* Only the content of a tab scrolls, so the tabs stay reachable at the end of a long text. */}
      <div className="ww-rules">
        <SetupTabs
          ariaLabel={t("werewolfRules.label")}
          tabs={[
            { content: game, id: "game", label: t("werewolfRules.tabGame") },
            { content: roles, id: "roles", label: t("werewolfRules.tabRoles") },
            { content: extras, id: "extras", label: t("werewolfRules.tabExtras") },
            { content: legend, id: "symbols", label: t("werewolfSymbols.tab") },
          ]}
        />
      </div>
    </Dialog>
  );
}
