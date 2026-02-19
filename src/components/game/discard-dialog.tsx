"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trash2, AlertTriangle, Clock } from "lucide-react";

interface DiscardDialogProps {
  gameId: string;
  playerIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function DiscardDialog({
  gameId,
  playerIndex,
  isOpen,
  onClose,
}: DiscardDialogProps) {
  const discardCards = useMutation(api.games.api.discardCards);
  const skipDiscard = useMutation(api.games.api.skipDiscard);
  const discardStatus = useQuery(api.games.api.getDiscardStatus, {
    gameId: gameId as Id<"games">,
    playerIndex,
  });

  const [discards, setDiscards] = useState({
    brick: 0,
    lumber: 0,
    ore: 0,
    grain: 0,
    wool: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Use real API data
  const currentDiscardStatus = discardStatus;

  // Timer effect - 30 seconds countdown
  useEffect(() => {
    if (!isOpen || !currentDiscardStatus?.needsToDiscard) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-discard randomly
          handleAutoDiscard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, currentDiscardStatus?.needsToDiscard]);

  const handleAutoDiscard = () => {
    if (!discardStatus) return;

    const resources = discardStatus.resources;
    const discardCount = discardStatus.discardCount;
    const autoDiscards = { brick: 0, lumber: 0, ore: 0, grain: 0, wool: 0 };

    // Create array of all cards
    const allCards: (keyof typeof resources)[] = [];
    Object.entries(resources).forEach(([resource, count]) => {
      for (let i = 0; i < (count as number); i++) {
        allCards.push(resource as keyof typeof resources);
      }
    });

    // Randomly select cards to discard
    for (let i = 0; i < discardCount && i < allCards.length; i++) {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      const selectedCard = allCards[randomIndex];
      autoDiscards[selectedCard]++;
      allCards.splice(randomIndex, 1);
    }

    setDiscards(autoDiscards);
    // Auto-submit after a short delay
    setTimeout(() => {
      handleDiscard();
    }, 1000);
  };

  const handleDiscardChange = (
    resource: keyof typeof discards,
    value: number,
  ) => {
    if (!currentDiscardStatus) return;

    const maxValue = currentDiscardStatus.resources[resource];
    const newValue = Math.max(0, Math.min(value, maxValue as number));

    // Calculate new total after this change
    const newDiscards = { ...discards, [resource]: newValue };
    const totalAfterChange = Object.values(newDiscards).reduce(
      (sum, count) => sum + count,
      0,
    );

    // Only allow the change if it doesn't exceed the required discard count
    if (totalAfterChange <= currentDiscardStatus.discardCount) {
      setDiscards(newDiscards);
    }
  };

  const totalDiscarded = Object.values(discards).reduce(
    (sum, count) => sum + count,
    0,
  );
  const isValidDiscard = currentDiscardStatus
    ? totalDiscarded === currentDiscardStatus.discardCount
    : false;

  const handleDiscard = async () => {
    if (!isValidDiscard) return;

    setIsSubmitting(true);
    try {
      await discardCards({
        gameId: gameId as Id<"games">,
        playerIndex,
        discards,
      });
      onClose();
      setDiscards({ brick: 0, lumber: 0, ore: 0, grain: 0, wool: 0 });
    } catch (error) {
      console.error("Failed to discard cards:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (currentDiscardStatus?.needsToDiscard) return;

    setIsSubmitting(true);
    try {
      await skipDiscard({ gameId: gameId as Id<"games">, playerIndex });
      onClose();
    } catch (error) {
      console.error("Failed to skip discard:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (!discardStatus) return null;

  const { resources, totalCards, needsToDiscard, discardCount } = discardStatus;

  // Check if this player has already completed their discard/skip
  // Players who never needed to discard (needsToDiscard = false) should see the "Continue" dialog
  // Players who needed to discard but have already done so will have currentTotalCards <= 7
  const currentTotalCards = Object.values(resources).reduce(
    (sum, count) => sum + (count as number),
    0,
  );
  const hasAlreadyDiscarded = needsToDiscard && currentTotalCards <= 7;

  // Don't show discard dialog to players who have already discarded
  // They will be handled by the "Continue" dialog below
  if (hasAlreadyDiscarded) {
    return null;
  }

  if (!needsToDiscard) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Discard Phase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have {totalCards} cards (7 or fewer), so you don't need to
              discard.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleSkip} disabled={isSubmitting}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Discard Cards
            <div className="ml-auto flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">
                {timeLeft}s
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time remaining</span>
              <span
                className={
                  timeLeft <= 10
                    ? "text-red-500 font-medium"
                    : "text-muted-foreground"
                }
              >
                {timeLeft}s
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className={timeLeft <= 10 ? "bg-red-100" : ""}
            />
            {timeLeft <= 10 && (
              <p className="text-xs text-red-500">
                Hurry! Cards will be discarded automatically when time runs out.
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-800">
              You have {totalCards} cards and must discard {discardCount} cards
              (half, rounding down)
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(resources).map(([resource, count]) => {
              const resourceKey = resource as keyof typeof discards;
              const discarded = discards[resourceKey];

              return (
                <div
                  key={resource}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getResourceIcon(resourceKey)}
                    </span>
                    <span className="capitalize">{resource}</span>
                    <Badge variant="outline">{count as number}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDiscardChange(resourceKey, discarded - 1)
                      }
                      disabled={discarded === 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {discarded}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDiscardChange(resourceKey, discarded + 1)
                      }
                      disabled={discarded >= (count as number)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total to discard:</span>
              <Badge variant={isValidDiscard ? "default" : "destructive"}>
                {totalDiscarded} / {discardCount}
              </Badge>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleDiscard}
                disabled={!isValidDiscard || isSubmitting}
              >
                Discard Cards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getResourceIcon(resource: string): string {
  const icons = {
    brick: "🧱",
    lumber: "🪵",
    ore: "⛏️",
    grain: "🌾",
    wool: "🐑",
  };
  return icons[resource as keyof typeof icons] || "❓";
}
