"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface StealResourceDialogProps {
  gameId: string;
  playerIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function StealResourceDialog({
  gameId,
  playerIndex,
  isOpen,
  onClose,
}: StealResourceDialogProps) {
  const stealResource = useMutation(api.robber.api.stealResource);
  const skipStealing = useMutation(api.robber.api.skipStealing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resource emoji mapping
  const RESOURCE_EMOJI: Record<string, string> = {
    brick: "🧱",
    lumber: "🪵",
    ore: "⛏️",
    grain: "🌾",
    wool: "🐑",
  };

  const stealablePlayers = useQuery(api.robber.api.getStealablePlayers, {
    gameId: gameId as Id<"games">,
  });

  const handleSteal = async (targetPlayerIndex: number) => {
    setIsSubmitting(true);
    console.log("Attempting to steal from player:", targetPlayerIndex);
    try {
      const result = await stealResource({
        gameId: gameId as Id<"games">,
        playerIndex,
        targetPlayerIndex,
      });

      console.log("Steal result:", result);

      // Show success toast to stealer
      const stolenResourceEmoji = RESOURCE_EMOJI[result.stolenResource] || "";
      const targetPlayer = stealablePlayers?.find(
        (p) => p.playerIndex === targetPlayerIndex,
      );

      toast.success(
        `You stole ${stolenResourceEmoji} ${result.stolenResource} from ${targetPlayer?.displayName || `Player ${targetPlayerIndex + 1}`}!`,
      );

      console.log("Steal completed successfully, closing dialog");
      onClose();
    } catch (error) {
      console.error("Failed to steal resource:", error);
      toast.error("Failed to steal resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await skipStealing({
        gameId: gameId as Id<"games">,
        playerIndex,
      });
      toast.info("No players to steal from - skipping steal phase");
      onClose();
    } catch (error) {
      console.error("Failed to skip stealing:", error);
      toast.error("Failed to skip stealing");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canSkip = !stealablePlayers || stealablePlayers.length === 0;

  return (
    <div className="fixed inset-0 bg-transparent flex items-end justify-end z-40 p-4 pointer-events-none">
      <Card className="w-96 shadow-2xl pointer-events-auto" data-steal-dialog>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-orange-500" />
            Steal a Resource
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stealablePlayers && stealablePlayers.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground">
                Select a player to steal a random resource from:
              </div>
              <div className="space-y-2">
                {stealablePlayers.map((player) => (
                  <div
                    key={player.playerIndex}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-${player.color}-500`}
                        style={{
                          backgroundColor:
                            player.color === "red"
                              ? "#ef4444"
                              : player.color === "blue"
                                ? "#3b82f6"
                                : player.color === "white"
                                  ? "#e5e7eb"
                                  : player.color === "orange"
                                    ? "#f97316"
                                    : "#6b7280",
                        }}
                      />
                      <span className="font-medium">{player.displayName}</span>
                      <Badge variant="secondary">
                        {player.totalResources} resources
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        console.log(
                          "Steal button clicked for player:",
                          player.playerIndex,
                        );
                        handleSteal(player.playerIndex);
                      }}
                      disabled={isSubmitting}
                    >
                      Steal
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800">
                  No players available to steal from
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Either no one has buildings adjacent to the robber, or they
                  have no resources
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {canSkip && (
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
            )}
            {!canSkip && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
