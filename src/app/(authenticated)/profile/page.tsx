"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileForm } from "@/components/profile/profile-form";
import { StatsDisplay } from "@/components/profile/stats-display";
import { AchievementsList } from "@/components/profile/achievements-list";
import { GameHistoryTable } from "@/components/profile/game-history-table";
import { User, Settings, Trophy, History } from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const userProfile = useQuery(api.users.api.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const userStats = useQuery(api.users.api.getUserStats, {
    clerkId: user?.id || "",
  });

  const updateProfile = useMutation(api.users.api.updateUserProfile);

  const isLoading = userProfile === undefined || userStats === undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile and view your gaming statistics
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <ProfileForm
                  userProfile={userProfile}
                  onSave={(data) => {
                    updateProfile({ clerkId: user?.id || "", ...data });
                    setIsEditing(false);
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={user?.imageUrl}
                        alt={user?.firstName || ""}
                      />
                      <AvatarFallback className="text-lg">
                        {user?.firstName?.charAt(0) ||
                          user?.username?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {userProfile?.displayName ||
                          `${user?.firstName} ${user?.lastName}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user?.emailAddresses?.[0]?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Display Name
                      </span>
                      <span className="text-sm font-medium">
                        {userProfile?.displayName || "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Member Since
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(
                          userProfile?._creationTime || 0,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Preferred Color
                      </span>
                      <Badge variant="outline">
                        {userProfile?.preferredColor || "None"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userStats?.gamesPlayed || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Games Played
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats?.gamesWon || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Games Won</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((userStats?.winRate || 0) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(userStats?.elo || 1000)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ELO Rating
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats and History */}
        <div className="lg:col-span-2 space-y-6">
          <StatsDisplay userProfile={userProfile} userStats={userStats} />
          <AchievementsList userProfile={userProfile} />
          <GameHistoryTable />
        </div>
      </div>
    </div>
  );
}
