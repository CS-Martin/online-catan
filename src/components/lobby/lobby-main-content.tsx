"use client";

import { Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LobbyMainContent({
  maxPlayers,
  lobbyPlayers,
}: {
  maxPlayers: number;
  lobbyPlayers: any[] | undefined;
}) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Max Players:</span>
              <span className="font-medium crypto-number">{maxPlayers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Map Type:</span>
              <span className="font-medium">Standard</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Victory Points:</span>
              <span className="font-medium crypto-number">10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Robber:</span>
              <span className="font-medium">Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Players
            <span className="text-sm font-normal text-muted-foreground">
              {lobbyPlayers?.length || 0}/{maxPlayers}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lobbyPlayers?.map((player, index) => (
              <div
                key={player._id}
                className={
                  "flex items-center justify-between p-3 rounded-lg border " +
                  (player.isReady ? "bg-green-500/10 border-green-500/30" : "")
                }
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    {!player.isAI && player.imageUrl && (
                      <AvatarImage
                        src={player.imageUrl}
                        alt={player.displayName ?? "Player"}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {player.isAI ? "AI" : "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {player.isAI
                        ? `AI Player ${index + 1}`
                        : (player.displayName ?? `Player ${index + 1}`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {player.isAI ? "Computer" : "Human"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {player.color !== "unassigned" && (
                    <Badge variant="outline">{player.color}</Badge>
                  )}
                  {player.isReady && (
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                      Ready
                    </Badge>
                  )}
                  {player.isHost && (
                    <Badge variant="outline" className="text-primary">
                      <Crown className="h-3 w-3 mr-1" />
                      Host
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {Array.from({
              length: Math.max(0, maxPlayers - (lobbyPlayers?.length || 0)),
            }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="flex items-center justify-center p-3 rounded-lg border border-dashed border-muted-foreground/30"
              >
                <span className="text-muted-foreground">Empty Slot</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
