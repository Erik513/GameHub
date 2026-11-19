import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  findGameByRoute,
  gameCatalog,
  isGameOpenable,
  type GameModuleDescriptor,
} from "../app/gameCatalog";
import { createRouteHash, homeRoute, parseHashRoute } from "../app/hashRoute";
import type { SupportedLanguage } from "../i18n";
import { AppShell } from "./AppShell";
import { GamePreviewPage } from "./GamePreviewPage";
import { GameSelectionPage } from "./GameSelectionPage";
import type { GameModule } from "./gameModule";

interface AppProps {
  /** Playable games; catalog entries without a module stay unavailable. */
  modules?: readonly GameModule[];
  cardLanguage: SupportedLanguage;
  onCardLanguageChange: (language: SupportedLanguage) => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export function App({
  cardLanguage,
  onCardLanguageChange,
  onLanguageChange,
  modules = [],
}: AppProps) {
  const { t } = useTranslation();
  const [currentRoute, setCurrentRoute] = useState(() => parseHashRoute(window.location.hash));
  const selectedGame = findGameByRoute(currentRoute);
  const GameScreen = modules.find((module) => module.id === selectedGame?.id)?.Screen;

  useEffect(() => {
    function handleHashChange() {
      setCurrentRoute(parseHashRoute(window.location.hash));
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(route: string) {
    window.location.hash = createRouteHash(route);
    setCurrentRoute(route);
  }

  function handleGameSelection(game: GameModuleDescriptor) {
    if (isGameOpenable(game)) {
      navigate(game.route);
    }
  }

  return (
    <AppShell
      gameTitle={
        selectedGame && isGameOpenable(selectedGame)
          ? t(`games.${selectedGame.translationKey}.title`)
          : undefined
      }
      onCloseGame={
        selectedGame && isGameOpenable(selectedGame) ? () => navigate(homeRoute) : undefined
      }
      onLanguageChange={(language) => onLanguageChange?.(language)}
    >
      {selectedGame && isGameOpenable(selectedGame) ? (
        <GamePreviewPage game={selectedGame}>
          {GameScreen && (
            <GameScreen cardLanguage={cardLanguage} onCardLanguageChange={onCardLanguageChange} />
          )}
        </GamePreviewPage>
      ) : (
        <GameSelectionPage games={gameCatalog} onSelect={handleGameSelection} />
      )}
    </AppShell>
  );
}
