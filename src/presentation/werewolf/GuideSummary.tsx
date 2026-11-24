import { Fragment, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { type GuideView } from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep } from "../../business/games/werewolf/roleStep";
import { Verdict } from "./RoleStepContent";
import { factOf } from "./stepText";
import type { SymbolId } from "./symbols/catalog";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

function Chosen({ children }: { readonly children: ReactNode }) {
  return <span className="ww-guide__chosen">{children}</span>;
}

/** The small "i" in a circle (the drawing of the info buttons): the line behind it is extra information, not a decision. */
function InfoMark() {
  return (
    <svg aria-hidden="true" focusable="false" height="20" viewBox="0 0 24 24" width="20">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 11v5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <circle cx="12" cy="7.8" r="1.3" fill="currentColor" />
    </svg>
  );
}

/** What the narrator chose in this step, so it can be checked before the role falls asleep. */
export function Summary({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { card, selection } = view;
  if (!card) return null;
  // A cover call: the narrator skipped it (the drunk cannot act); the decision stands in the summary and can be undone.
  if (card.cover)
    return view.phase === "outro" ? (
      <Chosen>{t("werewolfNarrator.guide.answeredNo")}</Chosen>
    ) : null;
  // The vote: who was nominated.
  if (view.state.status === "vote")
    return (
      <Chosen>
        <span className="ww-guide__chosen-part">
          <WerewolfSymbol id="vote" ring size={20} />
          <span>
            {t("werewolfNarrator.guide.day.chosen", { names: view.state.candidates.join(", ") })}
          </span>
        </span>
      </Chosen>
    );
  // The day: the only thing to sum up is "no vote" (the vote itself has its own steps).
  if (view.state.status === "day")
    return view.progress >= 1 || view.votedToday ? (
      <Chosen>
        {view.exiledToday.map((name) => (
          <Fragment key={name}>
            <span className="ww-guide__chosen-part">
              {/* The one who follows his lover has the symbol of the lovers, the one voted out the symbol of the vote. */}
              <WerewolfSymbol
                id={view.exiledByLove.includes(name) ? "lovers" : "vote"}
                ring
                size={20}
              />
              <span>{t("werewolfNarrator.guide.exile", { name })}</span>
            </span>
            {/* The tanner who was voted out has won: he keeps his role secret until the end of the game. */}
            {name === view.state.tannerWinner && (
              <span className="ww-guide__chosen-part">
                <WerewolfSymbol id="tanner" size={20} />
                <span>{t("werewolfNarrator.guide.tannerWon", { name })}</span>
              </span>
            )}
          </Fragment>
        ))}
        {/* A vote without anybody leaving (a tie, too few yes votes). */}
        {view.votedToday && view.exiledToday.length === 0 && (
          <span className="ww-guide__chosen-part">
            <WerewolfSymbol id="vote" ring size={20} />
            <span>{t("werewolfNarrator.guide.nobodyLeft")}</span>
          </span>
        )}
        {view.progress >= 1 && (
          <span className="ww-guide__chosen-part">
            <WerewolfSymbol id="vote" ring size={20} />
            <strong>{t("werewolfNarrator.guide.noVote")}</strong>
          </span>
        )}
      </Chosen>
    ) : null;
  // The wolves who skipped: no attack.
  if (view.state.status === "wolves" && selection.picks.length === 0 && view.phase === "outro")
    return <Chosen>{t("werewolfNarrator.guide.wolvesNoAttackDone")}</Chosen>;
  const step = describeRoleStep(view.state);
  const fact = factOf(view, t);
  // The drunk has no ability: the summary only says who he really is.
  if (card.abilities.length === 0)
    return view.state.status === "drunkReveal" || view.state.status === "drunkHunter" ? (
      <Chosen>{fact?.text}</Chosen>
    ) : null;
  // What was used, as the symbol of the ability, its name and the person: no prefix ("chosen").
  const part = (symbol: string, label: string, people: string) => (
    <span className="ww-guide__chosen-part" key={symbol + label}>
      <WerewolfSymbol id={symbol as SymbolId} ring size={20} />
      <span>
        <strong>{label}</strong>
        {": "}
        {people}
      </span>
    </span>
  );
  const symbolOf = (id: string) =>
    card.abilities.find((ability) => ability.id === id)?.symbol ?? "vote";
  // The werewolves do not attack in the first night (setting): the role does not "pass", there is simply no attack.
  if (step.statement === "noAttack")
    return <Chosen>{t("werewolfNarrator.guide.wolvesNoAttackDone")}</Chosen>;
  // The result of the seer or the investigator is shown: the choice is already in the game, not in the selection.
  if (step.result) {
    const { ability, name } = step.result;
    return (
      <Chosen>
        {/* "Looked at: Josie (Not a werewolf)": the verdict stands in the summary, green for a werewolf, red if not. */}
        <span className="ww-guide__chosen-part">
          <WerewolfSymbol id={symbolOf(ability)} ring size={20} />
          <span>
            <strong>{t(`werewolfNarrator.guide.abilityDone.${ability}`)}</strong>
            {": "}
            {name}
            {fact && (
              <>
                {" ("}
                <Verdict found={fact.wolf === true} text={fact.text} />
                {")"}
              </>
            )}
          </span>
        </span>
        {/* The investigator: in a second line all three people he looked at, green for a werewolf, red for not (extra information). */}
        {ability === "investigate" && view.investigated.length > 0 && (
          <span className="ww-guide__chosen-part">
            <InfoMark />
            <span>
              {"("}
              {view.investigated.map((person, index) => (
                <Fragment key={person.name}>
                  {index > 0 && " · "}
                  <span className="ww-verdict" data-wolf={person.wolf}>
                    {person.name}
                  </span>
                </Fragment>
              ))}
              {")"}
            </span>
          </span>
        )}
      </Chosen>
    );
  }
  // The holder of the amulet decided to keep it.
  if (step.skip.summary === "kept" && selection.picks.length === 0)
    return (
      <Chosen>
        <span className="ww-guide__chosen-part">
          <WerewolfSymbol id="amuletPass" size={20} />
          <span>
            {t("werewolfNarrator.guide.amuletKept", { name: view.state.amulet?.holder ?? "" })}
          </span>
        </span>
      </Chosen>
    );
  // A chosen person with his true role in brackets (the narrator only): the consequences depend on the role. The drunk who
  // does not know his role yet stands with both.
  const withRole = (name: string): string => {
    const player = view.state.players.find((entry) => entry.name === name);
    if (!player) return name;
    const role = t(`werewolfSymbols.items.${player.role}.name`);
    const masked = view.state.drunk?.player === name && !view.state.drunk.revealed;
    const text = masked
      ? t("werewolfNarrator.guide.deadMasked", {
          drunk: t("werewolfSymbols.items.drunk.name"),
          role,
        })
      : role;
    return `${name} (${text})`;
  };
  const parts: ReactNode[] = [];
  const skipped = t("werewolfNarrator.guide.answeredNo");
  const magician = view.potionRole === "magician";
  if (view.potionRole !== null) {
    // The witch and the magician: one row for every question that was answered, in the words of the script ("Save the
    // victim", "Poison somebody", ...), with what was decided or "skipped". The first question of the magician is
    // answered with a healing or with a death spell; the people of the first question stand before the later ones.
    const firstAnswered = view.question === "poison" || view.phase === "outro";
    const firstKills = magician ? selection.picks.slice(0, selection.spellPicks ?? 0) : [];
    const laterPicks = selection.picks.slice(firstKills.length);
    const second = magician ? "kill" : "poison";
    if (firstAnswered) {
      if (selection.heal)
        parts.push(
          part(
            symbolOf("heal"),
            t("werewolfNarrator.guide.abilityDone.heal"),
            view.state.wolfTarget
              ? withRole(view.state.wolfTarget.name)
              : t("werewolfNarrator.guide.nobody"),
          ),
        );
      else if (firstKills.length > 0)
        parts.push(
          part(
            symbolOf("kill"),
            t("werewolfNarrator.guide.abilityDone.kill"),
            firstKills.map(withRole).join(", "),
          ),
        );
      else
        parts.push(
          part(
            symbolOf("heal"),
            t(
              magician
                ? "werewolfNarrator.guide.summaryAsk.magicianFirst"
                : "werewolfNarrator.guide.summaryAsk.heal",
            ),
            skipped,
          ),
        );
    }
    if (laterPicks.length > 0)
      parts.push(
        part(
          symbolOf(second),
          t(`werewolfNarrator.guide.abilityDone.${second}`),
          laterPicks.map(withRole).join(", "),
        ),
      );
    else if (view.phase === "outro")
      parts.push(
        part(
          symbolOf(second),
          t(
            magician
              ? "werewolfNarrator.guide.summaryAsk.magicianSecond"
              : "werewolfNarrator.guide.summaryAsk.poison",
          ),
          skipped,
        ),
      );
  } else {
    // Cupid (and every other role with a list of people): what was chosen.
    const chosenAbility =
      selection.ability !== null && selection.ability !== "heal"
        ? selection.ability
        : selection.ability === null && selection.picks.length > 0 && step.compound === "bond"
          ? "bond"
          : null;
    if (chosenAbility) {
      const people =
        selection.none || selection.picks.length === 0
          ? t("werewolfNarrator.guide.nobody")
          : selection.picks.map(withRole).join(", ");
      parts.push(
        part(
          symbolOf(chosenAbility),
          t(`werewolfNarrator.guide.abilityDone.${chosenAbility}`),
          people,
        ),
      );
    }
  }
  const answeredNo = view.phase === "act" && view.question === "poison";
  return (
    <Chosen>
      {parts.length > 0
        ? parts
        : t(answeredNo ? "werewolfNarrator.guide.answeredNo" : "werewolfNarrator.guide.noChoice")}
    </Chosen>
  );
}
