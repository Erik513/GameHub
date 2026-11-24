import type { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  describeWinners,
  type DeathNote,
  type GuideView,
} from "../../business/games/werewolf/narratorGuide";
import {
  currentWerewolfRole,
  werewolfAnnouncement,
  type WerewolfState,
} from "../../business/games/werewolf/stateMachine";
import { DealCard } from "./DealCard";
import { PlayerRows } from "./PlayerRows";
import { variantOfRole } from "./roleAbilities";
import { lineGlyphs } from "./symbols/glyphs";
import type { SymbolId } from "./symbols/catalog";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

/** An eye: closed while something is covered, open while it is shown (the drawings are those of the symbols). */
export function EyeIcon({ open }: { readonly open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="ww-guide__eye"
      data-eye={open ? "open" : "closed"}
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
    >
      {lineGlyphs[open ? "eye" : "eyeClosed"].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}

/** A small mark behind a name in the list of voters: the mayor counts twice, the village idiot has to vote yes. */

/** The role in brackets behind a dead person; a drunk who was not revealed yet shows both, the drunk and the true role. */
function deadRoleText(death: DeathNote, t: TFunction): string {
  const role = t(`werewolfSymbols.items.${death.role as SymbolId}.name`);
  return death.masked
    ? t("werewolfNarrator.guide.deadMasked", { drunk: t("werewolfSymbols.items.drunk.name"), role })
    : role;
}

export function PlainBox({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { state } = view;
  // The people of the morning whose reason of death is shown: a tap shows it, another tap covers it again.
  const [shown, setShown] = useState<readonly string[]>([]);
  if (state.status === "roles") {
    const dealt = currentWerewolfRole(state);
    if (!dealt) return null;
    return (
      <DealCard
        amulet={state.amulet?.holder === dealt.name}
        key={dealt.name}
        mayor={state.settings.mayor}
        name={dealt.name}
        position={state.index + 1}
        role={dealt.role}
        total={state.players.length}
        variant={variantOfRole(dealt.role, state.settings)}
      />
    );
  }
  if (state.status === "morning") {
    const names = werewolfAnnouncement(state).map((entry) => entry.name);
    return (
      <section className="ww-guide ww-guide--sheet">
        <header className="ww-guide__head">
          <strong className="ww-guide__text">{t("werewolfNarrator.guide.morning.title")}</strong>
        </header>
        <div className="ww-guide__body">
          {names.length === 0 ? (
            <span className="ww-guide__lead">{t("werewolfNarrator.guide.morning.nobody")}</span>
          ) : (
            // Every dead person in a box of their own, one below the other: only names, never a role. The hunter is
            // dead but still shoots: he stands in a category of his own ("last shot"), and his role is public.
            (() => {
              const isHunter = (name: string) =>
                state.players.some((player) => player.name === name && player.role === "hunter");
              const dead = names.filter((name) => !isHunter(name));
              const shooters = names.filter(isHunter);
              const deathOf = (name: string) => view.deaths.find((death) => death.name === name);
              const box = (name: string, hunter: boolean) => (
                // The whole box is the button: a tap anywhere in it (also in the opened part) shows or covers the reason.
                // (The button inside keeps the keyboard and the screen reader working; its click reaches the box.)
                <li
                  data-role={hunter ? "hunter" : undefined}
                  key={name}
                  onClick={() =>
                    setShown((now) =>
                      now.includes(name) ? now.filter((other) => other !== name) : [...now, name],
                    )
                  }
                >
                  <button aria-expanded={shown.includes(name)} type="button">
                    <span className="ww-guide__dead-name">
                      {/* A closed eye while the reason is covered, an open one while it is shown. */}
                      <EyeIcon open={shown.includes(name)} />
                      {name}
                      {/* The role stands in brackets behind the name once the person is tapped (the hunter shows it always). */}
                      {shown.includes(name) && !hunter && deathOf(name) && (
                        <> ({deadRoleText(deathOf(name)!, t)})</>
                      )}
                    </span>
                    {hunter && (
                      <span className="ww-guide__dead-role">
                        <WerewolfSymbol id="hunter" size={22} />
                        {t("werewolfSymbols.items.hunter.name")}
                      </span>
                    )}
                  </button>
                  {shown.includes(name) && (
                    <div className="ww-guide__dead-causes">
                      <span className="ww-guide__dead-reason">
                        <small>{t("werewolfNarrator.guide.causesTitle")}</small>
                        <span>
                          {(deathOf(name)?.causes ?? [])
                            .map((cause) => t(`werewolfNarrator.cause.${cause}`))
                            .join(", ")}
                        </span>
                      </span>
                      {/* A place at the bottom right is always kept for the amulet that is lost with this death. */}
                      <span
                        className="ww-guide__dead-slot"
                        data-filled={deathOf(name)?.amuletLost === true ? true : undefined}
                      >
                        {deathOf(name)?.amuletLost && (
                          <WerewolfSymbol
                            id="amulet"
                            label={t("werewolfNarrator.guide.amuletLost")}
                            size={22}
                          />
                        )}
                      </span>
                    </div>
                  )}
                </li>
              );
              return (
                <>
                  {dead.length > 0 && (
                    <div className="ww-guide__dead">
                      <strong>{t("werewolfNarrator.guide.morning.died")}</strong>
                      <small>{t("werewolfNarrator.guide.causesHint")}</small>
                      <ul>{dead.map((name) => box(name, false))}</ul>
                    </div>
                  )}
                  {shooters.length > 0 && (
                    <div className="ww-guide__dead">
                      <strong>{t("werewolfNarrator.guide.morning.lastShot")}</strong>
                      {dead.length === 0 && <small>{t("werewolfNarrator.guide.causesHint")}</small>}
                      <ul>{shooters.map((name) => box(name, true))}</ul>
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
      </section>
    );
  }
  if (state.status === "exile") {
    const names = werewolfAnnouncement(state).map((entry) => entry.name);
    return (
      <section className="ww-guide ww-guide--sheet">
        <header className="ww-guide__head">
          <strong className="ww-guide__text">
            {t("werewolfNarrator.guide.exile", { name: state.victim.name })}
          </strong>
        </header>
        <div className="ww-guide__body">
          {names.length > 1 && (
            <span className="ww-guide__lead">
              {t("werewolfNarrator.guide.left", { names: names.join(", ") })}
            </span>
          )}
        </div>
      </section>
    );
  }
  if (state.status === "finished") return <WinnerList state={state} />;
  return null;
}

/** The winner view at the very end: every group of winners with the names of its players. */
function WinnerList({ state }: { readonly state: WerewolfState }) {
  const { t } = useTranslation();
  return (
    <section className="ww-guide ww-winners">
      <strong className="ww-guide__text">{t("werewolfNarrator.guide.finished.title")}</strong>
      <div className="ww-winners__groups">
        {describeWinners(state).map((group) => (
          <div className="ww-winners__group" key={group.kind}>
            <h4>
              <WerewolfSymbol
                id={
                  group.kind === "village"
                    ? "villager"
                    : group.kind === "wolves"
                      ? "wolf"
                      : group.kind === "tanner"
                        ? "tanner"
                        : "lovers"
                }
                size={22}
              />{" "}
              {t(`werewolfNarrator.guide.finished.${group.kind}`)}
            </h4>
            <ul>
              {group.players.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* All players with their colors: the living first, then the dead. */}
      <PlayerRows order="aliveFirst" state={state} />
    </section>
  );
}
