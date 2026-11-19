import { useTranslation } from "react-i18next";
import {
  isGameOpenable,
  type GameAvailability,
  type GameModuleDescriptor,
} from "../app/gameCatalog";
import { Button, Card, EmptyState } from "./components";
import { useFocusOnShow } from "./game-kit/useFocusOnShow";

interface GameSelectionPageProps {
  games: readonly GameModuleDescriptor[];
  onSelect: (game: GameModuleDescriptor) => void;
}

/** Playable games first, then games in development, the planned ones last. */
const availabilityOrder: Record<GameAvailability, number> = {
  available: 0,
  preview: 1,
  planned: 2,
};

export function GameSelectionPage({ games, onSelect }: GameSelectionPageProps) {
  const { i18n, t } = useTranslation();
  const focus = useFocusOnShow<HTMLElement>();
  // Within each group the games are sorted alphabetically by their title in the UI language.
  const sortedGames = [...games].sort(
    (a, b) =>
      availabilityOrder[a.availability] - availabilityOrder[b.availability] ||
      t(`games.${a.translationKey}.title`).localeCompare(
        t(`games.${b.translationKey}.title`),
        i18n.language,
      ),
  );

  return (
    <section
      className="game-library focus-target"
      aria-labelledby="game-library-title"
      ref={focus}
      tabIndex={-1}
    >
      <div className="page-intro">
        <p className="eyebrow">{t("gameSelection.eyebrow")}</p>
        <h1 id="game-library-title">{t("gameSelection.title")}</h1>
        <p>{t("gameSelection.intro")}</p>
      </div>
      {games.length === 0 ? (
        <EmptyState
          description={t("feedback.emptyGames.description")}
          title={t("feedback.emptyGames.title")}
        />
      ) : null}
      <ul className="game-grid" aria-label={t("gameSelection.title")}>
        {sortedGames.map((game) => {
          const openable = isGameOpenable(game);

          return (
            <li key={game.id}>
              <Card
                className="game-card"
                data-accent={game.accent}
                data-locked={!openable || undefined}
                data-playable={game.availability === "available" || undefined}
              >
                <div className="game-card__body">
                  {/* A finished game has no label; only games in development and planned games have one. */}
                  {game.availability !== "available" && (
                    <span className="game-status" data-status={game.availability}>
                      {t(`gameSelection.status.${game.availability}`)}
                    </span>
                  )}
                  <h2>{t(`games.${game.translationKey}.title`)}</h2>
                  <p>{t(`games.${game.translationKey}.description`)}</p>
                </div>
                <Button
                  disabled={!openable}
                  variant={openable ? "primary" : "secondary"}
                  onClick={() => onSelect(game)}
                >
                  {t("gameSelection.action.play")}
                </Button>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
