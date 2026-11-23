import { useTranslation } from "react-i18next";
import { HoldButton } from "./HoldButton";
import type { VoteProps } from "./NarratorCard";

/**
 * The lower box at the vote: the narrator enters how many votes every nominated person got and, where the mayor has the
 * double vote, whom the second vote goes to. The upper box only shows the result.
 */
export function VoteInput({ votes }: { readonly votes: VoteProps }) {
  const { t } = useTranslation();
  // With the double vote of the mayor (several nominated people) one vote is kept free for the second vote.
  const limit =
    votes.total - (votes.bonus && !votes.bonus.yesNo && votes.bonus.chosen === null ? 1 : 0);
  return (
    <div className="ww-voteinput">
      <ul aria-label={t("werewolfNarrator.guide.vote.nominees")} className="ww-nominees">
        {votes.names.map((name) => {
          const count = votes.counts[name] ?? 0;
          return (
            <li className="ww-nominee" key={name}>
              <strong className="ww-nominee__name">{name}</strong>
              <span className="ww-nominee__count">
                {votes.yesLabel && <small className="ww-nominee__yes">{votes.yesLabel}</small>}
                <HoldButton
                  disabled={count <= 0}
                  label={t("werewolfNarrator.guide.vote.fewer", { name })}
                  onStep={() => votes.onCount(name, count - 1)}
                >
                  −
                </HoldButton>
                {/* The second vote of the mayor is assigned to this person: the number includes it and stands in a blue box. */}
                <output
                  aria-label={t("werewolfNarrator.guide.vote.votesOf", { name })}
                  data-second={votes.bonus?.chosen === name || undefined}
                >
                  {count + (votes.bonus?.chosen === name ? 1 : 0)}
                </output>
                <HoldButton
                  disabled={
                    votes.sum >= limit ||
                    count + (votes.bonus?.chosen === name ? 1 : 0) >=
                      (votes.max[name] ?? votes.total)
                  }
                  label={t("werewolfNarrator.guide.vote.more", { name })}
                  onStep={() => votes.onCount(name, count + 1)}
                >
                  +
                </HoldButton>
              </span>
            </li>
          );
        })}
      </ul>
      {votes.bonus && (
        <div className="ww-nominees__bonus" role="group" aria-label={votes.bonus.label}>
          <span className="ww-nominees__bonus-label">
            <span className="ww-nominees__prefix">{votes.bonus.prefix}</span>
            <b className="ww-name ww-nominees__mayor">{votes.bonus.mayor}</b>
          </span>
          <div className="ww-nominees__choices">
            {votes.bonus.yesNo ? (
              <>
                <button
                  aria-pressed={votes.bonus.chosen === null}
                  onClick={() => votes.bonus?.onChoose(null)}
                  type="button"
                >
                  {votes.bonus.noLabel}
                </button>
                <button
                  aria-pressed={votes.bonus.chosen !== null}
                  onClick={() => votes.bonus?.onChoose(votes.bonus?.choices[0] ?? null)}
                  type="button"
                >
                  {votes.bonus.yesLabel}
                </button>
              </>
            ) : (
              votes.bonus.choices.map((name) => (
                <button
                  aria-pressed={votes.bonus?.chosen === name}
                  disabled={
                    votes.bonus?.chosen !== name &&
                    (votes.counts[name] ?? 0) + 1 > (votes.max[name] ?? votes.total)
                  }
                  key={name}
                  onClick={() => votes.bonus?.onChoose(name)}
                  type="button"
                >
                  {name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {votes.legend && (
        <table className="ww-vote__legend">
          <thead>
            <tr>
              <th scope="col">{votes.legend.heading[0]}</th>
              <th scope="col">{votes.legend.heading[1]}</th>
            </tr>
          </thead>
          <tbody>
            {votes.legend.rows.map((row) => (
              <tr data-kind={row.kind} key={row.range}>
                <td>{row.range}</td>
                <td>{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
