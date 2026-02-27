import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import GameCanvas from "@/components/GameCanvas";
import StartMenu from "@/components/StartMenu";
import GameOverScreen from "@/components/GameOverScreen";
import Leaderboard from "@/components/Leaderboard";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";

const queryClient = new QueryClient();

export type GameState = "menu" | "playing" | "gameOver";

function AppContent() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [finalScore, setFinalScore] = useState(0);
  const { loginStatus, login, clear, identity } = useInternetIdentity();

  const handleStartGame = () => {
    setGameState("playing");
    setFinalScore(0);
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setGameState("gameOver");
  };

  const handleRestart = () => {
    setGameState("playing");
    setFinalScore(0);
  };

  const handleBackToMenu = () => {
    setGameState("menu");
    setFinalScore(0);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background layer with animated grid */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0 animate-[slide_20s_linear_infinite]"
            style={{
              background: "linear-gradient(oklch(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, oklch(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "50px 50px"
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {gameState === "menu" && (
          <StartMenu
            onStartGame={handleStartGame}
            loginStatus={loginStatus}
            onLogin={login}
            onLogout={clear}
            identity={identity}
          />
        )}

        {gameState === "playing" && (
          <GameCanvas
            onGameOver={handleGameOver}
            identity={identity}
          />
        )}

        {gameState === "gameOver" && (
          <GameOverScreen
            score={finalScore}
            onRestart={handleRestart}
            onBackToMenu={handleBackToMenu}
            identity={identity}
          />
        )}
      </div>

      <Toaster />

      <style>{`
        @keyframes slide {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AppContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
