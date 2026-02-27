import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Home, Trophy, Loader2 } from "lucide-react";
import type { Identity } from "@icp-sdk/core/agent";
import { useSubmitScore } from "@/hooks/useQueries";
import { toast } from "sonner";
import Leaderboard from "./Leaderboard";

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onBackToMenu: () => void;
  identity: Identity | null | undefined;
}

export default function GameOverScreen({
  score,
  onRestart,
  onBackToMenu,
  identity,
}: GameOverScreenProps) {
  const [playerName, setPlayerName] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const submitScoreMutation = useSubmitScore();

  const handleSubmitScore = async () => {
    if (hasSubmitted) return;

    try {
      await submitScoreMutation.mutateAsync({
        playerName: playerName || null,
        score,
      });
      setHasSubmitted(true);
      toast.success("Score submitted to leaderboard!");
    } catch (error) {
      console.error("Failed to submit score:", error);
      toast.error("Failed to submit score");
    }
  };

  const isLoggedIn = !!identity;

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Game Over Card */}
        <Card className="border-2 border-destructive shadow-[0_0_30px_oklch(var(--destructive)/0.4)] animate-[shake_0.5s_ease-in-out]">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-5xl font-display tracking-wider mb-2 text-destructive">
              GAME OVER
            </CardTitle>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Trophy className="h-12 w-12 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground font-display">FINAL DISTANCE</div>
                <div className="text-6xl font-display font-bold text-primary">
                  {score}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoggedIn ? (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border-2 border-border">
                {hasSubmitted ? (
                  <div className="text-center space-y-2">
                    <Trophy className="h-12 w-12 text-accent mx-auto" />
                    <p className="text-lg font-display text-foreground">
                      Score Submitted!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Check the leaderboard to see your ranking
                    </p>
                  </div>
                ) : submitScoreMutation.isPending ? (
                  <div className="text-center space-y-2 py-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                    <p className="text-lg font-display text-foreground">
                      Submitting score...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="playerName" className="font-display">
                      Player Name (Optional)
                    </Label>
                    <Input
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={30}
                      className="border-2"
                    />
                    <Button
                      onClick={handleSubmitScore}
                      className="w-full"
                      disabled={submitScoreMutation.isPending}
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      Submit Score
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-lg border-2 border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet on the menu to save your score to the leaderboard
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                onClick={onRestart}
                size="lg"
                className="text-lg py-6 font-display shadow-[0_0_15px_oklch(var(--primary)/0.3)]"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                RETRY
              </Button>
              <Button
                onClick={onBackToMenu}
                size="lg"
                variant="outline"
                className="text-lg py-6 font-display border-2"
              >
                <Home className="mr-2 h-5 w-5" />
                MENU
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Leaderboard />
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
}
