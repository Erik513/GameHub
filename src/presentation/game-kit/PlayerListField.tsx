import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAutoGrow } from "./useAutoGrow";

interface PlayerListFieldProps {
  readonly hint: string;
  readonly onChange: (text: string) => void;
  readonly value: string;
}

/** The text field where the player names are typed, one per line or separated by commas. */
export function PlayerListField({ hint, onChange, value }: PlayerListFieldProps) {
  const { t } = useTranslation();
  const input = useRef<HTMLTextAreaElement>(null);
  useAutoGrow(input, value);

  return (
    <>
      <p className="kit-players__hint">{hint}</p>
      <textarea
        aria-label={t("kitPlayers.label")}
        className="field__input kit-players__input"
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("kitPlayers.placeholder")}
        ref={input}
        rows={2}
        value={value}
      />
    </>
  );
}
