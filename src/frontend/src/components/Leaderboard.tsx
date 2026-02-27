import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Loader2 } from "lucide-react";
import { useTopScores } from "@/hooks/useQueries";

export default function Leaderboard() {
  const { data: scores, isLoading, error } = useTopScores(10);

  return (
    <Card className="border-2 border-secondary shadow-[0_0_30px_oklch(var(--secondary)/0.3)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-3xl font-display">
          <Trophy className="h-8 w-8 text-accent" />
          LEADERBOARD
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-destructive">
              Failed to load leaderboard
            </div>
          )}

          {scores && scores.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No scores yet. Be the first!
            </div>
          )}

          {scores && scores.length > 0 && (
            <div className="space-y-2">
              {scores.map((entry, index) => {
                const rank = index + 1;
                const isTopThree = rank <= 3;
                const medalColors = ["text-accent", "text-primary", "text-secondary"];
                const medalColor = isTopThree ? medalColors[rank - 1] : "";

                return (
                  <div
                    key={`${entry.player.toString()}-${entry.timestamp}`}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      isTopThree
                        ? "bg-card border-2 border-border shadow-lg"
                        : "bg-muted/30"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-display text-lg font-bold ${
                        isTopThree ? `${medalColor} bg-card` : "text-muted-foreground"
                      }`}
                    >
                      {rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {entry.playerName || entry.player.toString().slice(0, 10) + "..."}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(Number(entry.timestamp) / 1_000_000).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-2xl font-display font-bold ${isTopThree ? medalColor : ""}`}>
                      {entry.score.toString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
