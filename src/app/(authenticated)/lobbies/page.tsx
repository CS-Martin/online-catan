"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users, Clock, MapPin, Eye, Swords } from "lucide-react";
import Link from "next/link";
import { LobbyCard } from "@/components/lobby/lobby-card";
import { CreateLobbyDialog } from "@/components/lobby/create-lobby-dialog";

export default function LobbiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const lobbies = useQuery(api.lobbies.api.getLobbies, {});
  const isLoading = lobbies === undefined;

  const filteredLobbies = lobbies?.filter((lobby) =>
    lobby.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-crypto">
              Game Lobbies
            </h1>
            <p className="text-muted-foreground">
              Browse and join available games
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Lobby
          </Button>
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-crypto">
            Game Lobbies
          </h1>
          <p className="text-muted-foreground">
            Browse and join available games
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Lobby
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lobbies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Map View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lobby Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary crypto-number">
              {filteredLobbies?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Active Lobbies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 crypto-number">
              {filteredLobbies?.filter((l) => l.status === "waiting").length ||
                0}
            </div>
            <div className="text-sm text-muted-foreground">Waiting</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 crypto-number">
              {filteredLobbies?.filter((l) => l.status === "in_game").length ||
                0}
            </div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 crypto-number">
              {filteredLobbies?.filter((l) => l.playerCount >= l.maxPlayers)
                .length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Full</div>
          </CardContent>
        </Card>
      </div>

      {/* Lobby List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLobbies?.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Lobbies Available
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Be the first to create a game and invite others to join!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Lobby
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredLobbies?.map((lobby) => (
            <LobbyCard key={lobby._id} lobby={lobby} />
          )) || []
        )}
      </div>

      {/* Create Lobby Dialog */}
      <CreateLobbyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
