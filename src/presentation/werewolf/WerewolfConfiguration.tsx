import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  chooseFixedAlternative,
  chooseFixedVariant,
  describeFixedConfiguration,
  setFixedSetting,
  setFixedWolfCount,
  toggleFixedRole,
  type FixedDraft,
  type FixedIssue,
  type FixedItemView,
} from "../../business/games/werewolf/fixedConfiguration";
import type { WerewolfSpecialRole } from "../../business/games/werewolf/configuration";
import { Button } from "../components";
import { ChoiceGroup, SetupTabs, StartBar, useFocusOnShow } from "../game-kit";
import { ConfigInfo } from "./ConfigInfo";
import { RoleTile, VariantTile } from "./ConfigTiles";

interface WerewolfConfigurationProps {
  readonly draft: FixedDraft;
  readonly onChange: (draft: FixedDraft) => void;
  readonly onDone: () => void;
  /** The number of players besides the narrator. */
  readonly players: number;
}

/** The variants of a variant item, in the order they are shown. */
const variantValues = {
  hunter: ["required", "optional"],
  mayor: ["doubleVote", "hammer"],
  spellcaster: ["allowed", "forbidden"],
  tanner: ["anyDeath", "voteOnly"],
} as const;

/**
 * The configuration of the fixed roles in two tabs. "Roles": the fixed roles in a box (wolves with their
 * choice, the villagers with their number, the seer who is always in), the extras, and the roles in two
 * boxes (the available ones, the ones that are not available yet), each in rows by the number of players
 * that unlocks them. "Game rules": the general rules. Nothing is chosen by itself: a choice that no longer
 * fits (for example after a change of the players) is shown as an issue with a button for a fitting wolf
 * count, and the narrator decides.
 */
export function WerewolfConfiguration({
  draft,
  onChange,
  onDone,
  players,
}: WerewolfConfigurationProps) {
  const { t } = useTranslation();
  const focus = useFocusOnShow<HTMLElement>();
  const view = describeFixedConfiguration(players, draft);
  // Only the fixed roles are built; the variable configuration follows later.
  const [mode, setMode] = useState<"fixed" | "variable">("fixed");

  const roleName = (role: WerewolfSpecialRole) => t(`werewolfConfig.roles.${role}`);
  const issueText = (issue: FixedIssue): string => {
    switch (issue.code) {
      case "roleMinimum":
        return t("werewolfConfig.issues.roleMinimum", {
          minimum: issue.minimum,
          role: roleName(issue.role),
        });
      case "addonMinimum":
        return t("werewolfConfig.issues.addonMinimum", {
          addon: t(`werewolfConfig.addons.${issue.addon}`),
          minimum: issue.minimum,
        });
      case "wolfCount":
        return t("werewolfConfig.issues.wolfCount", { count: issue.count });
      case "players":
        return t("werewolfConfig.issues.players", { count: issue.count });
      case "noSeat":
        return t("werewolfConfig.issues.noSeat", { roles: issue.roles });
      case "hammerMinimum":
        return t("werewolfConfig.issues.hammerMinimum", { minimum: issue.minimum });
      case "combination":
        return t("werewolfConfig.issues.combination");
      case "drunkWolves":
        return t("werewolfConfig.issues.drunkWolves");
      case "invalid":
        return t("werewolfConfig.issues.invalid");
    }
  };

  function renderItem(entry: FixedItemView) {
    const name = t(`werewolfConfig.items.${entry.id}`);
    if (entry.kind === "toggle") {
      return (
        <RoleTile
          infoId={entry.id}
          key={entry.id}
          lock={entry.lock}
          minimum={entry.minimum}
          name={name}
          onToggle={() => onChange(toggleFixedRole(draft, entry.roles[0]!))}
          selected={entry.selected}
        />
      );
    }
    const choices =
      entry.kind === "alternative"
        ? entry.roles.map((role) => ({ label: roleName(role), value: role }))
        : variantValues[entry.id as keyof typeof variantValues].map((value) => ({
            label: t(`werewolfConfig.variants.${value}`),
            locked: entry.lockedVariants.includes(value),
            value,
          }));
    return (
      <VariantTile
        choices={choices}
        infoId={entry.id}
        key={entry.id}
        lock={entry.lock}
        minimum={entry.minimum}
        name={name}
        onPick={(value) =>
          onChange(
            entry.kind === "alternative"
              ? chooseFixedAlternative(draft, entry.roles, value as WerewolfSpecialRole | null)
              : chooseFixedVariant(draft, entry.id as keyof typeof variantValues, value),
          )
        }
        value={entry.kind === "alternative" ? entry.chosenRole : entry.variant}
      />
    );
  }

  /**
   * One box with all the roles, in rows by the number of players that unlocks them; the rows are set
   * apart by lines, and with `titles` every row also says from how many players it is available.
   */
  function renderBox(
    heading: string,
    entries: readonly FixedItemView[],
    titles: boolean,
    hint?: string,
  ) {
    const minimums = [...new Set(entries.map((entry) => entry.minimum))].sort((a, b) => a - b);
    return (
      <section className="ww-box">
        <h3 className="ww-box__title">{heading}</h3>
        {hint && <p className="ww-hint">{hint}</p>}
        {minimums.map((minimum) => (
          <div className="ww-row" key={minimum}>
            {titles && (
              <h4 className="ww-row__title">{t("werewolfConfig.row", { count: minimum })}</h4>
            )}
            <div className="ww-grid">
              {entries
                .filter((entry) => entry.minimum === minimum)
                // The plain tiles come first, two to a row; the roles with variants follow, one to a row.
                .sort(
                  (left, right) => Number(left.kind !== "toggle") - Number(right.kind !== "toggle"),
                )
                .map(renderItem)}
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Only the roles that need more players go to the lower box; a role that does not fit the chosen
  // roles stays in the upper box, dimmed, with its reason.
  const available = view.items.filter((entry) => entry.lock !== "minimumPlayers");
  const locked = view.items.filter((entry) => entry.lock === "minimumPlayers");
  const hasIssues = view.issues.length > 0;

  const rolesTab: ReactNode = (
    <>
      <ChoiceGroup
        hideLegend
        initial="fixed"
        legend={t("werewolfConfig.modeLabel")}
        name="mode"
        onChange={(value) => setMode(value === "variable" ? "variable" : "fixed")}
        options={[
          { label: t("werewolfConfig.modeFixed"), value: "fixed" },
          { label: t("werewolfConfig.modeVariable"), value: "variable" },
        ]}
        value={mode}
      />
      {mode === "variable" ? (
        <p className="ww-hint">{t("werewolfConfig.variableLater")}</p>
      ) : (
        <>
          <p className="ww-hint">{t("werewolfConfig.forPlayers", { count: players })}</p>

          <section className="ww-box ww-core">
            <h3 className="ww-box__title">{t("werewolfConfig.coreHeading")}</h3>
            <div className="ww-core__row">
              <div className="ww-core__cell">
                <div className="ww-head">
                  <h4>{t("werewolfConfig.wolves")}</h4>
                  <ConfigInfo id="wolves" name={t("werewolfConfig.wolves")} />
                </div>
                <div aria-label={t("werewolfConfig.wolves")} className="ww-wolves" role="group">
                  {view.wolf.options.map((option) => (
                    <div className="ww-wolves__option" key={option.count}>
                      <button
                        aria-pressed={option.selected}
                        className="ww-wolves__button"
                        data-fixed={view.wolf.fixed || undefined}
                        data-recommended={option.recommended || undefined}
                        disabled={!option.selectable && !option.selected}
                        onClick={() => {
                          if (!view.wolf.fixed) onChange(setFixedWolfCount(draft, option.count));
                        }}
                        type="button"
                      >
                        {option.count}
                      </button>
                      <small>{option.recommended ? t("werewolfConfig.recommended") : " "}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ww-core__cell">
                <div className="ww-head">
                  <h4>{t("werewolfConfig.seer")}</h4>
                  <ConfigInfo id="seer" name={t("werewolfConfig.seer")} />
                </div>
                {/* The seer is always in the game: the button stays pressed. */}
                <div className="ww-wolves__option">
                  <button
                    aria-label={t("werewolfConfig.seer")}
                    aria-pressed="true"
                    className="ww-wolves__button"
                    data-fixed
                    type="button"
                  >
                    1
                  </button>
                  <small> </small>
                </div>
              </div>
              <div className="ww-core__cell">
                <div className="ww-head">
                  <h4>{t("werewolfConfig.villagers")}</h4>
                  <ConfigInfo id="villagers" name={t("werewolfConfig.villagers")} />
                </div>
                <strong className="ww-villagers__number">
                  {view.villagers ?? t("werewolfConfig.villagersNone")}
                </strong>
              </div>
            </div>
            <div className="ww-row">
              <h4 className="ww-row__title">{t("werewolfConfig.extrasHeading")}</h4>
              <div className="ww-grid">
                {view.addons.map((addon) => (
                  <RoleTile
                    infoId={addon.id}
                    key={addon.id}
                    lock={addon.lock}
                    minimum={addon.minimum}
                    name={t(`werewolfConfig.addons.${addon.id}`)}
                    onToggle={() => onChange(setFixedSetting(draft, addon.id, !addon.selected))}
                    selected={addon.selected}
                  />
                ))}
              </div>
            </div>
          </section>

          {hasIssues && (
            <section aria-live="polite" className="ww-issues">
              <h3>{t("werewolfConfig.issuesHeading")}</h3>
              <ul>
                {view.issues.map((issue) => (
                  <li
                    key={`${issue.code}-${"role" in issue ? issue.role : ""}-${"addon" in issue ? issue.addon : ""}`}
                  >
                    {issueText(issue)}
                  </li>
                ))}
              </ul>
              {view.suggestedWolfCount !== null && (
                <Button
                  onClick={() => onChange(setFixedWolfCount(draft, view.suggestedWolfCount!))}
                  variant="secondary"
                >
                  {t("werewolfConfig.useWolves", { count: view.suggestedWolfCount })}
                </Button>
              )}
            </section>
          )}

          {renderBox(
            t("werewolfConfig.availableHeading"),
            available,
            false,
            t("werewolfConfig.variantHint"),
          )}
          {locked.length > 0 && renderBox(t("werewolfConfig.unavailableHeading"), locked, true)}
        </>
      )}
    </>
  );

  const rulesTab: ReactNode = (
    <>
      <ChoiceGroup
        initial={draft.settings.attackOnFirstNight ? "night1" : "night2"}
        legend={t("werewolfConfig.attackLabel")}
        name="attack"
        onChange={(value) =>
          onChange(setFixedSetting(draft, "attackOnFirstNight", value === "night1"))
        }
        options={[
          { label: t("werewolfConfig.attackNight2"), value: "night2" },
          { label: t("werewolfConfig.attackNight1"), value: "night1" },
        ]}
        value={draft.settings.attackOnFirstNight ? "night1" : "night2"}
      />
      <ChoiceGroup
        initial={draft.settings.revealRoles ? "open" : "secret"}
        legend={t("werewolfConfig.revealLabel")}
        name="reveal"
        onChange={(value) => onChange(setFixedSetting(draft, "revealRoles", value === "open"))}
        options={[
          { label: t("werewolfConfig.revealOpen"), value: "open" },
          { label: t("werewolfConfig.revealSecret"), value: "secret" },
        ]}
        value={draft.settings.revealRoles ? "open" : "secret"}
      />
    </>
  );

  return (
    <section
      aria-label={t("werewolfConfig.label")}
      className="kit-onepage ww-config focus-target"
      ref={focus}
      tabIndex={-1}
    >
      {!view.supported ? (
        <p className="ww-hint">{t("werewolfConfig.tooFewPlayers", { count: players })}</p>
      ) : (
        <SetupTabs
          ariaLabel={t("werewolfConfig.label")}
          tabs={[
            { content: rolesTab, id: "roles", label: t("werewolfConfig.rolesTab") },
            { content: rulesTab, id: "rules", label: t("werewolfConfig.rulesTab") },
          ]}
        />
      )}
      <StartBar>
        <Button onClick={onDone} variant="success">
          {t("werewolfConfig.done")}
        </Button>
      </StartBar>
    </section>
  );
}
