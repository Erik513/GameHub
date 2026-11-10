import { useEffect, useState } from "react";
import { findGameByRoute, gameCatalog, type GameModuleDescriptor } from "../app/gameCatalog";
import { createRouteHash, homeRoute, parseHashRoute } from "../app/hashRoute";
import type { SupportedLanguage } from "../i18n";
import { AppShell } from "./AppShell";
import { GamePreviewPage } from "./GamePreviewPage";
import { GameSelectionPage } from "./GameSelectionPage";
import { TabooSetup } from "./taboo/TabooSetup";
import type { TabooCard } from "../business/games/taboo/model";

const gameScreens: Partial<
  Record<
    GameModuleDescriptor["translationKey"],
    (language: SupportedLanguage, cards: readonly TabooCard[]) => React.ReactNode
  >
> = {
  taboo: (language, cards) => <TabooSetup cardLanguage={language} cards={cards} />,
};

interface AppProps {
  tabooCards?: readonly TabooCard[];
  cardLanguage: SupportedLanguage;
  onCardLanguageChange: (language: SupportedLanguage) => void;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export function App({
  cardLanguage,
  onCardLanguageChange,
  onLanguageChange,
  tabooCards = [],
}: AppProps) {
  const [currentRoute, setCurrentRoute] = useState(() => parseHashRoute(window.location.hash));
  const selectedGame = findGameByRoute(currentRoute);

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
    if (game.availability !== "planned") {
      navigate(game.route);
    }
  }

  return (
    <AppShell
      cardLanguage={cardLanguage}
      currentRoute={selectedGame ? currentRoute : homeRoute}
      onCardLanguageChange={onCardLanguageChange}
      onLanguageChange={(language) => onLanguageChange?.(language)}
    >
      {selectedGame && selectedGame.availability !== "planned" ? (
        <GamePreviewPage game={selectedGame} onBack={() => navigate(homeRoute)}>
          {gameScreens[selectedGame.translationKey]?.(cardLanguage, tabooCards)}
        </GamePreviewPage>
      ) : (
        <GameSelectionPage games={gameCatalog} onSelect={handleGameSelection} />
      )}
    </AppShell>
  );
}
