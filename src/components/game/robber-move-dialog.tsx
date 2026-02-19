"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Move } from "lucide-react";

interface RobberMoveDialogProps {
  gameId: string;
  playerIndex: number;
  isOpen: boolean;
  onClose: () => void;
  selectedHexId: number | null;
  setSelectedHexId: (hexId: number | null) => void;
}

export function RobberMoveDialog({
  gameId,
  playerIndex,
  isOpen,
  onClose,
  selectedHexId,
  setSelectedHexId,
}: RobberMoveDialogProps) {
  const moveRobber = useMutation(api.robber.api.moveRobber);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get game data to find hex details
  const game = useQuery(api.games.api.getGame, {
    gameId: gameId as Id<"games">,
  });

  console.log("RobberMoveDialog render:", { selectedHexId, isOpen });

  // Get selected hex details
  const selectedHex = game?.board.hexes.find(
    (hex: any) => hex.id === selectedHexId,
  );

  // Resource emoji mapping
  const RESOURCE_EMOJI: Record<string, string> = {
    brick: "🧱",
    lumber: "🪵",
    ore: "⛏️",
    grain: "🌾",
    wool: "🐑",
    desert: "🏜️",
  };

  const handleMoveRobber = async () => {
    if (!selectedHexId) return;

    console.log("Moving robber to hex:", selectedHexId);
    setIsSubmitting(true);
    try {
      await moveRobber({
        gameId: gameId as Id<"games">,
        playerIndex,
        hexId: selectedHexId,
      });

      // The backend will automatically advance to robber_steal phase
      onClose();
      setSelectedHexId(null);
    } catch (error) {
      console.error("Failed to move robber:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent flex items-end justify-end z-40 p-4 pointer-events-none">
      <Card className="w-96 shadow-2xl pointer-events-auto" data-robber-dialog>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5 text-blue-500" />
            Move the Robber
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedHexId && selectedHex && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800">
                ✅ Selected {RESOURCE_EMOJI[selectedHex.resource] || ""}{" "}
                {selectedHex.resource} #
                {selectedHex.numberToken || selectedHexId} - Ready to move!
              </p>
            </div>
          )}

          {!selectedHexId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800">
                💡 Click any hex tile to select where to move the robber
              </p>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>• The robber cannot stay on the same hex</p>
            <p>• After moving, you'll be able to steal a resource</p>
            <p>• Choose a hex with adjacent players to steal from</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleMoveRobber}
              disabled={!selectedHexId || isSubmitting}
            >
              {isSubmitting ? "Moving..." : "Move Robber"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
