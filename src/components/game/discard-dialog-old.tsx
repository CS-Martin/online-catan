"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
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
  const discardCards = useMutation(api.games.discardCards);
  const skipDiscard = useMutation(api.games.skipDiscard);
  const discardStatus = useQuery(api.games.getDiscardStatus, {
    gameId,
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

  useEffect(() => {
    if (!isOpen || !discardStatus?.needsToDiscard) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoDiscard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, discardStatus?.needsToDiscard]);

  const handleAutoDiscard = () => {
    if (!discardStatus) return;

    const resources = discardStatus.resources;
    const discardCount = discardStatus.discardCount;
    const autoDiscards = { brick: 0, lumber: 0, ore: 0, grain: 0, wool: 0 };

    const allCards: (keyof typeof resources)[] = [];
    Object.entries(resources).forEach(([resource, count]) => {
      for (let i = 0; i < (count as number); i++) {
        allCards.push(resource as keyof typeof resources);
      }
    });

    for (let i = 0; i < discardCount && i < allCards.length; i++) {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      const selectedCard = allCards[randomIndex];
      autoDiscards[selectedCard]++;
      allCards.splice(randomIndex, 1);
    }

    setDiscards(autoDiscards);
    setTimeout(() => {
      handleDiscard();
    }, 1000);
  };

  const handleDiscardChange = (
    resource: keyof typeof discards,
    value: number,
  ) => {
    const maxValue = discardStatus.resources[resource];
    const newValue = Math.max(0, Math.min(value, maxValue as number));
    setDiscards((prev) => ({ ...prev, [resource]: newValue }));
  };

  const totalDiscarded = Object.values(discards).reduce(
    (sum, count) => sum + count,
    0,
  );
  const isValidDiscard = totalDiscarded === discardStatus.discardCount;

  const handleDiscard = async () => {
    if (!isValidDiscard) return;

    setIsSubmitting(true);
    try {
      await discardCards({ gameId, playerIndex, discards });
      onClose();
      setDiscards({ brick: 0, lumber: 0, ore: 0, grain: 0, wool: 0 });
    } catch (error) {
      console.error("Failed to discard cards:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (needsToDiscard) return;

    setIsSubmitting(true);
    try {
      await skipDiscard({ gameId, playerIndex });
      onClose();
    } catch (error) {
      console.error("Failed to skip discard:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resourceColors = {
    brick: "bg-orange-500",
    lumber: "bg-green-500",
    ore: "bg-gray-500",
    grain: "bg-yellow-500",
    wool: "bg-pink-500",
  };

  const resourceIcons = {
    brick: "🧱",
    lumber: "🪵",
    ore: "⛏️",
    grain: "🌾",
    wool: "🐑",
  };

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Discard Cards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                      {resourceIcons[resourceKey]}
                    </span>
                    <span className="capitalize">{resource}</span>
                    <Badge variant="outline">{count}</Badge>
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
                      disabled={discarded >= count}
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
