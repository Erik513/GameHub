/*
 * The content of a step in the lower box. The box itself (header, body, strip) is one building block for every role; what
 * a role says in it comes from here, chosen by the description of the step (`describeRoleStep`).
 */

const thumbUp =
  "M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z";
const thumbDown =
  "M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z";

/** A small thumb up inside a text (the magician's question: "save the person (thumb up)"). */
export function ThumbIcon() {
  return (
    <svg
      aria-hidden="true"
      className="ww-thumb"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
    >
      <path
        d={thumbUp}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/** The verdict of the seer or the investigator: a thumb up in green when a werewolf was found, a thumb down in red when not. */
export function Verdict({ found, text }: { readonly found: boolean; readonly text: string }) {
  return (
    <span className="ww-verdict" data-wolf={found}>
      <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
        <path
          d={found ? thumbUp : thumbDown}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      {text}
    </span>
  );
}
