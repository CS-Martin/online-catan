"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, Zap, Target } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export function AchievementHighlights() {
  // Placeholder achievements - in real app, these would come from the user's achievements
  const achievements: Achievement[] = [
    {
      id: "first-win",
      name: "First Victory",
      description: "Win your first game of Catan",
      icon: <Trophy className="h-4 w-4" />,
      unlockedAt: Date.now() - 86400000, // 1 day ago
      rarity: "common",
    },
    {
      id: "road-builder",
      name: "Road Builder",
      description: "Build 10 roads in a single game",
      icon: <Target className="h-4 w-4" />,
      progress: 7,
      maxProgress: 10,
      rarity: "rare",
    },
    {
      id: "lucky-roller",
      name: "Lucky Roller",
      description: "Roll three 7s in a row",
      icon: <Zap className="h-4 w-4" />,
      progress: 2,
      maxProgress: 3,
      rarity: "epic",
    },
    {
      id: "master-trader",
      name: "Master Trader",
      description: "Complete 50 successful trades",
      icon: <Star className="h-4 w-4" />,
      progress: 35,
      maxProgress: 50,
      rarity: "legendary",
    },
  ];

  const getRarityColor = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "legendary":
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  const getRarityBadgeVariant = (rarity: Achievement["rarity"]) => {
    switch (rarity) {
      case "common":
        return "secondary";
      case "rare":
        return "default";
      case "epic":
        return "default";
      case "legendary":
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievement Highlights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.slice(0, 4).map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full border ${getRarityColor(
                    achievement.rarity
                  )}`}
                >
                  {achievement.icon}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <Badge
                      variant={getRarityBadgeVariant(
                        achievement.rarity
                      ) as any}
                      className="text-xs"
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                  {achievement.progress !== undefined &&
                    achievement.maxProgress && (
                      <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                </div>
              </div>
              <div className="text-right">
                {achievement.unlockedAt ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Trophy className="h-3 w-3" />
                    <span className="text-xs">Unlocked</span>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {achievement.progress}/{achievement.maxProgress}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AchievementHighlightsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievement Highlights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
