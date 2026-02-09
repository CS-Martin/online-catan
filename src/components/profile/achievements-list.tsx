"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Zap, Target, Crown, Flame } from "lucide-react";

interface AchievementsListProps {
  userProfile: any;
}

export function AchievementsList({ userProfile }: AchievementsListProps) {
  // Placeholder achievements - in real app, these would come from the user's achievements
  const allAchievements = [
    {
      id: "first-win",
      name: "First Victory",
      description: "Win your first game of Catan",
      icon: <Trophy className="h-5 w-5" />,
      rarity: "common" as const,
      unlocked: true,
    },
    {
      id: "road-master",
      name: "Road Master",
      description: "Build 50 roads across all games",
      icon: <Target className="h-5 w-5" />,
      rarity: "rare" as const,
      unlocked: false,
    },
    {
      id: "trader-king",
      name: "Trader King",
      description: "Complete 100 successful trades",
      icon: <Star className="h-5 w-5" />,
      rarity: "epic" as const,
      unlocked: false,
    },
    {
      id: "speed-demon",
      name: "Speed Demon",
      description: "Win a game in under 30 minutes",
      icon: <Zap className="h-5 w-5" />,
      rarity: "epic" as const,
      unlocked: false,
    },
    {
      id: "comeback-king",
      name: "Comeback King",
      description: "Win after being behind by 5+ victory points",
      icon: <Flame className="h-5 w-5" />,
      rarity: "legendary" as const,
      unlocked: false,
    },
    {
      id: "catan-legend",
      name: "Catan Legend",
      description: "Reach level 50",
      icon: <Crown className="h-5 w-5" />,
      rarity: "legendary" as const,
      unlocked: false,
    },
  ];

  const getRarityColor = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return "bg-gray-100 text-gray-400 border-gray-200";
    
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "legendary":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRarityBadgeVariant = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return "secondary";
    
    switch (rarity) {
      case "common":
        return "secondary";
      case "rare":
        return "default";
      case "epic":
        return "default";
      case "legendary":
        return "default";
      default:
        return "secondary";
    }
  };

  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;

  if (!userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
          <Badge variant="outline">
            {unlockedCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                achievement.unlocked
                  ? "hover:bg-accent/50 border-primary/20"
                  : "opacity-60 border-muted"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full border ${getRarityColor(
                    achievement.rarity,
                    achievement.unlocked
                  )}`}
                >
                  {achievement.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p
                      className={`font-medium text-sm ${
                        achievement.unlocked ? "" : "text-muted-foreground"
                      }`}
                    >
                      {achievement.name}
                    </p>
                    <Badge
                      variant={getRarityBadgeVariant(
                        achievement.rarity,
                        achievement.unlocked
                      ) as any}
                      className="text-xs"
                    >
                      {achievement.rarity}
                    </Badge>
                    {achievement.unlocked && (
                      <Badge variant="default" className="text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {unlockedCount === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No achievements unlocked yet</p>
              <p className="text-sm">Start playing to unlock achievements</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
