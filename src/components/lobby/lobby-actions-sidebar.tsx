"use client";

import Link from "next/link";
import { Clock, Swords, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LobbyActionsSidebar({
  lobbyStatus,
  gameId,
  isPrivate,
  inviteCode,
  maxPlayers,
  lobbyPlayers,
  isHost,
  currentUserPlayer,
  isJoining,
  isStarting,
  onJoin,
  onLeave,
  onToggleReady,
  onStartGame,
}: {
  lobbyStatus: string;
  gameId?: string;
  isPrivate: boolean;
  inviteCode?: string;
  maxPlayers: number;
  lobbyPlayers: any[] | undefined;
  isHost: boolean;
  currentUserPlayer: any | undefined;
  isJoining: boolean;
  isStarting: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onToggleReady: () => void;
  onStartGame: () => void;
}) {
  const humanPlayers = (lobbyPlayers ?? []).filter((p) => !p.isAI);
  const allHumansReady = humanPlayers.every((p) => p.isReady);
  const canStartGame =
    lobbyStatus === "waiting" && humanPlayers.length >= 2 && allHumansReady;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lobbyStatus === "waiting" && (
            <>
              {isHost ? (
                <div className="space-y-2">
                  {currentUserPlayer && (
                    <Button
                      className="w-full"
                      onClick={onToggleReady}
                      variant={
                        currentUserPlayer.isReady ? "default" : "outline"
                      }
                    >
                      {currentUserPlayer.isReady ? (
                        <>
                          <span className="mr-2">✓</span>
                          Ready!
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Not Ready
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    className="w-full"
                    disabled={!canStartGame || isStarting}
                    onClick={onStartGame}
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    {isStarting ? "Starting..." : "Start Game"}
                  </Button>
                </div>
              ) : currentUserPlayer ? (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={onToggleReady}
                    variant={currentUserPlayer.isReady ? "default" : "outline"}
                  >
                    {currentUserPlayer.isReady ? (
                      <>
                        <span className="mr-2">✓</span>
                        Ready!
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Not Ready
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onLeave}
                  >
                    Leave Lobby
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  disabled={
                    (lobbyPlayers?.length || 0) >= maxPlayers || isJoining
                  }
                  onClick={onJoin}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {isJoining ? "Joining..." : "Join Lobby"}
                </Button>
              )}
            </>
          )}

          {lobbyStatus === "in_game" && (
            <Button className="w-full" asChild>
              <Link href={`/games/${gameId}`}>
                <Swords className="h-4 w-4 mr-2" />
                Enter Game
              </Link>
            </Button>
          )}

          <Button variant="outline" className="w-full">
            Invite Players
          </Button>
        </CardContent>
      </Card>

      {isPrivate && inviteCode && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-primary crypto-number">
                {inviteCode}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Share this code with friends to invite them
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
