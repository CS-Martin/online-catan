"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Swords,
  Eye,
  Users,
  Trophy,
  Clock,
  Gamepad2,
  Map,
  Home,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const userStats = useQuery(api.users.api.getUserStats, {
    clerkId: user?.id || "",
  });

  const isLoading = userStats === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm">Welcome to Catan</p>
          <p className="text-muted-foreground">
            Loading your island overview...
          </p>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-xl font-crypto">Welcome to Catan</h1>
        <p className="text-muted-foreground">
          No active games available. Start a new adventure!
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Map className="h-5 w-5" />
              <span>START ADVENTURE</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full h-14 text-lg">
              <Link href="/lobbies/create">
                <Swords className="mr-2 h-5 w-5" />
                CREATE NEW GAME
              </Link>
            </Button>

            <div className="grid gap-3">
              <Button variant="outline" asChild className="h-12">
                <Link href="/play/quick-match">
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  QUICK MATCH
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-12">
                <Link href="/lobbies">
                  <Users className="mr-2 h-4 w-4" />
                  GAME LOBBIES
                </Link>
              </Button>

              <Button variant="outline" asChild className="h-12">
                <Link href="/spectate">
                  <Eye className="mr-2 h-4 w-4" />
                  SPECTATE GAMES
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>RECENT GAMES</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-surface-variant rounded-lg">
                    <div className="text-2xl font-bold text-green-400 crypto-number-alt">
                      {userStats.gamesWon}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      VICTORIES
                    </div>
                  </div>
                  <div className="text-center p-4 bg-surface-variant rounded-lg">
                    <div className="text-2xl font-bold text-blue-400 crypto-number-alt">
                      {Math.round(userStats.elo)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ELO RATING
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent games</p>
                <p className="text-sm">
                  Start playing to see your game history
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Status */}
      <Card>
        <CardHeader>
          <CardTitle>GAME STATUS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="font-medium">Online</div>
                <div className="text-sm text-muted-foreground">
                  Ready to play
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {userStats?.gamesPlayed || 0} Games
                </div>
                <div className="text-sm text-muted-foreground">
                  Total played
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {Math.round((userStats?.winRate || 0) * 100)}% Win Rate
                </div>
                <div className="text-sm text-muted-foreground">
                  Success rate
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
