"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, Gamepad } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Game {
  _id: string;
  status: "setup" | "active" | "finished";
  winnerId?: string;
  lobbyId: string;
  turnNumber: number;
  _creationTime: number;
}

export function RecentGames() {
  const { user } = useUser();

  // For now, we'll show a placeholder until we implement the games query
  // const recentGames = useQuery(api.games.getRecentGames, {
  //   clerkId: user?.id || "",
  // });

  // Placeholder data for demonstration
  const placeholderGames = [
    {
      _id: "1",
      status: "finished" as const,
      winnerId: user?.id,
      lobbyId: "lobby1",
      turnNumber: 45,
      _creationTime: Date.now() - 3600000, // 1 hour ago
      opponentName: "Player123",
      result: "Victory",
      duration: "45 min",
    },
    {
      _id: "2",
      status: "finished" as const,
      winnerId: "other",
      lobbyId: "lobby2",
      turnNumber: 32,
      _creationTime: Date.now() - 7200000, // 2 hours ago
      opponentName: "ProGamer",
      result: "Defeat",
      duration: "32 min",
    },
  ];

  const games = placeholderGames; // recentGames || placeholderGames;
  const isLoading = false; // recentGames === undefined;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!games.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gamepad className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No games played yet</p>
            <p className="text-sm">Start playing to see your game history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game._id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      game.result === "Victory" ? "default" : "secondary"
                    }
                    className="flex items-center space-x-1"
                  >
                    {game.result === "Victory" ? (
                      <Trophy className="h-3 w-3" />
                    ) : null}
                    <span>{game.result}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    vs {game.opponentName}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{game.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{game.turnNumber} turns</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(game._creationTime, { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
