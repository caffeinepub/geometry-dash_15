import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, LogIn, LogOut } from "lucide-react";
import type { Identity } from "@icp-sdk/core/agent";
import type { Status } from "@/hooks/useInternetIdentity";
import Leaderboard from "./Leaderboard";

interface StartMenuProps {
  onStartGame: () => void;
  loginStatus: Status;
  onLogin: () => void;
  onLogout: () => void;
  identity: Identity | null | undefined;
}

export default function StartMenu({
  onStartGame,
  loginStatus,
  onLogin,
  onLogout,
  identity,
}: StartMenuProps) {
  const isLoggedIn = loginStatus === "success" && identity;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Main menu */}
        <Card className="border-2 border-primary shadow-[0_0_30px_oklch(var(--primary)/0.3)]">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-6xl font-display tracking-wider mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-pulse">
              NEON DASH
            </CardTitle>
            <CardDescription className="text-xl text-foreground/80">
              Click to jump. Don't hit the spikes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={onStartGame}
              size="lg"
              className="w-full text-2xl py-8 font-display tracking-widest shadow-[0_0_20px_oklch(var(--primary)/0.5)] hover:shadow-[0_0_30px_oklch(var(--primary)/0.8)] transition-all duration-300"
            >
              <Play className="mr-3 h-8 w-8" />
              START GAME
            </Button>

            <div className="space-y-3 pt-4 border-t-2 border-border">
              {isLoggedIn ? (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    Connected: {identity.getPrincipal().toString().slice(0, 10)}...
                  </p>
                  <Button
                    onClick={onLogout}
                    variant="outline"
                    className="w-full border-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onLogin}
                  variant="outline"
                  disabled={loginStatus === "logging-in"}
                  className="w-full border-2"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loginStatus === "logging-in" ? "Connecting..." : "Connect to Save Score"}
                </Button>
              )}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground pt-4">
              <h3 className="font-display text-foreground text-lg">CONTROLS</h3>
              <ul className="space-y-1 pl-4">
                <li>• Click, tap, or press SPACE to jump</li>
                <li>• Avoid spikes and obstacles</li>
                <li>• Survive as long as you can</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Leaderboard />
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 right-0 text-center text-xs text-muted-foreground">
        © 2026. Built with love using{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-secondary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
