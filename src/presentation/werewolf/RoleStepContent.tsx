import { useTranslation } from "react-i18next";
import type { GuideView } from "../../business/games/werewolf/narratorGuide";
import type { RoleStepSpec } from "../../business/games/werewolf/roleStep";
import type { WerewolfState } from "../../business/games/werewolf/stateMachine";

/*
 * The content of a step in the lower box. The box itself (header, body, strip) is one building block for every role; what
 * a role says in it comes from here, chosen by the description of the step (`describeRoleStep`).
 */

const thumbUp =
  "M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z";
const thumbDown =
  "M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z";

/**
 * The result of the seer or the investigator in front of the sentence: a thumb up in green when a werewolf was found,
 * a thumb down in red when not. Other steps show the text alone.
 */
export function ResultText({
  state,
  step,
  text,
}: {
  readonly state: WerewolfState;
  readonly step: RoleStepSpec;
  readonly text: string;
}) {
  const found =
    state.status === "vision"
      ? state.isWolf
      : state.status === "investigation"
        ? state.isWolfNearby
        : null;
  if (step.kind !== "result" || found === null) return <>{text}</>;
  return (
    <span className="ww-verdict" data-wolf={found}>
      <svg aria-hidden="true" fill="none" height="40" viewBox="0 0 24 24" width="40">
        <path
          d={found ? thumbUp : thumbDown}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
      {text}
    </span>
  );
}

/** What the narrator has to keep in mind during the day: who is silenced, who is wounded. */
export function DayNotes({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { silenced, wounded } = view.notes;
  if (!silenced && wounded.length === 0) return null;
  return (
    <ul className="ww-guide__notes">
      {silenced && <li>{t("werewolfNarrator.guide.silenced", { name: silenced })}</li>}
      {wounded.length > 0 && (
        <li>{t("werewolfNarrator.guide.wounded", { names: wounded.join(", ") })}</li>
      )}
    </ul>
  );
}
