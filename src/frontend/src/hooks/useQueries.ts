import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { ScoreEntry } from "@/backend.d";

export function useTopScores(count: number = 10) {
  const { actor, isFetching } = useActor();
  
  return useQuery<ScoreEntry[]>({
    queryKey: ["topScores", count],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopGlobalScores(BigInt(count));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerName,
      score,
    }: {
      playerName: string | null;
      score: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.submitScore(playerName, BigInt(score));
    },
    onSuccess: () => {
      // Invalidate and refetch leaderboard
      queryClient.invalidateQueries({ queryKey: ["topScores"] });
    },
  });
}

export function useCallerScores() {
  const { actor, isFetching } = useActor();

  return useQuery<ScoreEntry[]>({
    queryKey: ["callerScores"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerScores();
    },
    enabled: !!actor && !isFetching,
  });
}
