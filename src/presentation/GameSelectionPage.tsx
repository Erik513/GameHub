import { useTranslation } from "react-i18next";
import type { GameModuleDescriptor } from "../app/gameCatalog";
import { Button, Card, EmptyState } from "./components";

interface GameSelectionPageProps {
  games: readonly GameModuleDescriptor[];
  onSelect: (game: GameModuleDescriptor) => void;
}

export function GameSelectionPage({ games, onSelect }: GameSelectionPageProps) {
  const { t } = useTranslation();

  return (
    <section className="game-library" aria-labelledby="game-library-title">
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
        {games.map((game) => {
          const isPlanned = game.availability === "planned";

          return (
            <li key={game.id}>
              <Card className="game-card" data-accent={game.accent}>
                <div className="game-card__body">
                  <span className="game-status" data-status={game.availability}>
                    {t(`gameSelection.status.${game.availability}`)}
                  </span>
                  <h2>{t(`games.${game.translationKey}.title`)}</h2>
                  <p>{t(`games.${game.translationKey}.description`)}</p>
                </div>
                <Button
                  disabled={isPlanned}
                  variant={isPlanned ? "secondary" : "primary"}
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
