"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Clock,
  Users,
  Gamepad,
  TrendingUp,
  TrendingDown,
  Clock as HistoryIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function GameHistoryTable() {
  // Placeholder game history data - in real app, this would come from the games query
  const gameHistory = [
    {
      id: "1",
      opponentName: "Player123",
      result: "victory" as const,
      score: 10,
      opponentScore: 7,
      duration: 45,
      turns: 45,
      eloChange: +25,
      date: Date.now() - 3600000, // 1 hour ago
      mapType: "Standard",
    },
    {
      id: "2",
      opponentName: "ProGamer",
      result: "defeat" as const,
      score: 8,
      opponentScore: 10,
      duration: 32,
      turns: 32,
      eloChange: -18,
      date: Date.now() - 7200000, // 2 hours ago
      mapType: "Standard",
    },
    {
      id: "3",
      opponentName: "CasualPlayer",
      result: "victory" as const,
      score: 10,
      opponentScore: 5,
      duration: 28,
      turns: 28,
      eloChange: +15,
      date: Date.now() - 86400000, // 1 day ago
      mapType: "Seafarers",
    },
    {
      id: "4",
      opponentName: "StrategicMind",
      result: "victory" as const,
      score: 10,
      opponentScore: 9,
      duration: 67,
      turns: 67,
      eloChange: +32,
      date: Date.now() - 172800000, // 2 days ago
      mapType: "Standard",
    },
    {
      id: "5",
      opponentName: "RookiePlayer",
      result: "victory" as const,
      score: 10,
      opponentScore: 3,
      duration: 22,
      turns: 22,
      eloChange: +8,
      date: Date.now() - 259200000, // 3 days ago
      mapType: "Standard",
    },
  ];

  const getResultBadge = (result: string) => {
    switch (result) {
      case "victory":
        return (
          <Badge variant="default" className="flex items-center space-x-1">
            <Trophy className="h-3 w-3" />
            <span>Victory</span>
          </Badge>
        );
      case "defeat":
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <span>Defeat</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  const getEloChangeIcon = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span>+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="h-3 w-3 mr-1" />
          <span>{change}</span>
        </div>
      );
    }
    return <span className="text-muted-foreground">0</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HistoryIcon className="h-5 w-5" />
          <span>Game History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gameHistory.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    {getResultBadge(game.result)}
                    <span className="font-medium">{game.opponentName}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{game.duration}m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{game.turns} turns</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Gamepad className="h-3 w-3" />
                      <span>{game.mapType}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {game.score} - {game.opponentScore}
                  </span>
                  {getEloChangeIcon(game.eloChange)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(game.date, { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}

          {gameHistory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gamepad className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No games played yet</p>
              <p className="text-sm">Start playing to see your game history</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function GameHistoryTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Game History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-5 w-16 ml-auto" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
