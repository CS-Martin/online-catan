"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Users, Swords, Eye, Zap, Map as MapIcon } from "lucide-react";
import Link from "next/link";

export function Sidebar({ className }: { className?: string }) {
  const { user } = useUser();
  const userStats = useQuery(api.users.api.getUserStats, {
    clerkId: user?.id || "",
  });

  const operations = [
    {
      title: "QUICK MATCH",
      description: "Find opponents instantly",
      icon: <Zap className="h-5 w-5" />,
      href: "/play/quick-match",
      variant: "default" as const,
    },
    {
      title: "JOIN BY CODE",
      description: "Enter a lobby code",
      icon: <Users className="h-5 w-5" />,
      href: "/lobbies/join",
      variant: "outline" as const,
    },
    {
      title: "CREATE LOBBY",
      description: "Host your own game",
      icon: <Swords className="h-5 w-5" />,
      href: "/lobbies/create",
      variant: "outline" as const,
    },
  ];

  const gameActions = [
    {
      title: "GAME LOBBIES",
      description: "View available games",
      icon: <Swords className="h-4 w-4" />,
      href: "/lobbies",
    },
    {
      title: "SPECTATE GAMES",
      description: "Watch ongoing games",
      icon: <Eye className="h-4 w-4" />,
      href: "/spectate",
    },
  ];

  return (
    <div className={cn("p-4 space-y-6", className)}>
      {/* User Profile Card */}
      <Card className="bg-surface-variant border-border">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col items-center gap-3 sm:flex-col sm:items-center sm:gap-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarImage src={user?.imageUrl} alt={user?.firstName || ""} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>
            <div className="w-full text-center sm:text-center">
              <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">
                {user?.firstName || "Player"}
              </h3>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-center">
                <Badge variant="outline" className="text-xs">
                  ELO {Math.round(userStats?.elo || 1000)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Level{" "}
                  {userStats?.gamesPlayed
                    ? Math.floor(userStats.gamesPlayed / 10) + 1
                    : 1}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-400 crypto-number-alt">
                {userStats?.gamesWon || 0}
              </div>
              <div className="text-xs text-muted-foreground">VICTORY</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-400 crypto-number-alt">
                {(userStats?.gamesPlayed || 0) - (userStats?.gamesWon || 0)}
              </div>
              <div className="text-xs text-muted-foreground">DEFEAT</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-400 crypto-number-alt">
                {userStats?.gamesPlayed
                  ? Math.round(
                      (userStats.gamesWon / userStats.gamesPlayed) * 100,
                    )
                  : 0}
                %
              </div>
              <div className="text-xs text-muted-foreground">WIN RATE</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-400 crypto-number-alt">
                {Math.round(userStats?.elo || 1000)}
              </div>
              <div className="text-xs text-muted-foreground">ELO RATING</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Actions */}
      <div className="space-y-3">
        {gameActions.map((action, index) => (
          <Button
            key={index}
            asChild
            variant="outline"
            className="w-full justify-start h-12 bg-surface-variant border-border hover:bg-accent hover:text-accent-foreground"
          >
            <Link href={action.href} className="flex items-center space-x-3">
              {action.icon}
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </div>

      {/* Available Operations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <MapIcon className="h-5 w-5" />
          <span>GAME OPTIONS</span>
        </h3>
        <div className="space-y-3">
          {operations.map((operation, index) => (
            <Button
              key={index}
              asChild
              variant={operation.variant}
              className={`
                w-full justify-start h-14 p-4
                ${
                  operation.variant === "default"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                    : "bg-surface-variant border-border hover:bg-accent hover:text-accent-foreground"
                }
              `}
            >
              <Link
                href={operation.href}
                className="flex items-center space-x-3"
              >
                {operation.icon}
                <div className="text-left">
                  <div className="font-semibold">{operation.title}</div>
                  <div className="text-xs opacity-80">
                    {operation.description}
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
