"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  TrendingUp, 
  Users, 
  Hammer,
  Route,
  Star
} from "lucide-react";

interface StatsDisplayProps {
  userProfile: any;
  userStats: {
    gamesPlayed: number;
    gamesWon: number;
    elo: number;
    winRate: number;
  } | null;
}

export function StatsDisplay({ userProfile, userStats }: StatsDisplayProps) {
  const getPlayStyleColor = (style?: string) => {
    switch (style) {
      case "aggressive":
        return "bg-red-100 text-red-800 border-red-200";
      case "trader":
        return "bg-green-100 text-green-800 border-green-200";
      case "builder":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "strategic":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLevelColor = (level?: number) => {
    if (!level) return "text-gray-600";
    if (level >= 50) return "text-orange-600";
    if (level >= 30) return "text-purple-600";
    if (level >= 20) return "text-blue-600";
    if (level >= 10) return "text-green-600";
    return "text-gray-600";
  };

  const experienceProgress = userProfile?.experiencePoints 
    ? (userProfile.experiencePoints % 1000) / 1000 * 100 
    : 0;

  if (!userStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Performance</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <div className="flex items-center space-x-2">
                  <Progress value={userStats.winRate * 100} className="w-20" />
                  <span className="text-sm font-medium">
                    {Math.round(userStats.winRate * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ELO Rating</span>
                <Badge variant={userStats.elo > 1200 ? "default" : "secondary"}>
                  {Math.round(userStats.elo)}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Level</span>
                <div className="flex items-center space-x-2">
                  <Star className={`h-4 w-4 ${getLevelColor(userProfile?.level)}`} />
                  <span className={`font-medium ${getLevelColor(userProfile?.level)}`}>
                    {userProfile?.level || 1}
                  </span>
                </div>
              </div>

              {userProfile?.experiencePoints && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Experience</span>
                    <span className="text-sm font-medium">
                      {userProfile.experiencePoints} XP
                    </span>
                  </div>
                  <Progress value={experienceProgress} className="w-full" />
                </div>
              )}
            </div>
          </div>

          {/* Play Style Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Play Style</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Style</span>
                {userProfile?.playStyle ? (
                  <Badge className={getPlayStyleColor(userProfile.playStyle)}>
                    {userProfile.playStyle}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Not determined</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Favorite Resource</span>
                <Badge variant="outline">
                  {userProfile?.favoriteResource || "None"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Preferred Color</span>
                <Badge variant="outline">
                  {userProfile?.preferredColor || "None"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hours Played</span>
                <span className="text-sm font-medium">
                  {userProfile?.hoursPlayed || 0}h
                </span>
              </div>
            </div>
          </div>

          {/* Building Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Hammer className="h-5 w-5" />
              <span>Building</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Settlements</span>
                <span className="text-sm font-medium">
                  {userProfile?.totalBuildings?.settlements || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cities</span>
                <span className="text-sm font-medium">
                  {userProfile?.totalBuildings?.cities || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Roads</span>
                <span className="text-sm font-medium">
                  {userProfile?.totalBuildings?.roads || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Longest Road</span>
                <span className="text-sm font-medium">
                  {userProfile?.longestRoadEver || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Special Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Special</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Trades</span>
                <span className="text-sm font-medium">
                  {userProfile?.totalTrades || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Robber Moves</span>
                <span className="text-sm font-medium">
                  {userProfile?.totalRobberMoves || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Turns</span>
                <span className="text-sm font-medium">
                  {userProfile?.totalTurnsPlayed || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fastest Win</span>
                <span className="text-sm font-medium">
                  {userProfile?.fastestWin ? `${userProfile.fastestWin}m` : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
