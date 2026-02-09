"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Clock,
  Eye,
  Swords,
  MapPin,
  Shield,
  Crown,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

interface LobbyCardProps {
  lobby: {
    _id: string;
    name: string;
    hostId: string;
    maxPlayers: number;
    status: "waiting" | "starting" | "color_selection" | "in_game" | "closed";
    isPrivate: boolean;
    inviteCode?: string;
    gameId?: string;
    _creationTime: number;
  };
}

export function LobbyCard({ lobby }: LobbyCardProps) {
  const { user } = useUser();
  const isHost = lobby.hostId === user?.id;

  // Fetch lobby players to check if current user is already in the lobby
  const lobbyPlayers = useQuery(api.lobbies.api.getLobbyPlayers, {
    lobbyId: lobby._id as any,
  });
  const currentUserInLobby = lobbyPlayers?.some(
    (p: any) => !p.isAI && p.clerkId && p.clerkId === user?.id,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "starting":
        return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      case "in_game":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "finished":
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Waiting";
      case "in_progress":
        return "In Progress";
      case "finished":
        return "Finished";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "waiting":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Swords className="h-4 w-4" />;
      case "finished":
        return <Crown className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const isFull = false; // We'll need to fetch player count separately
  const canJoin =
    lobby.status === "waiting" && !isFull && !isHost && !currentUserInLobby;

  return (
    <Card
      className={`defi-card hover:shadow-lg transition-all duration-300 ${
        canJoin ? "cursor-pointer hover:border-primary/50" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between space-y-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">{lobby.name}</h3>
              {lobby.isPrivate && (
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span className="crypto-number">
                  {lobbyPlayers?.length || 0}/{lobby.maxPlayers}
                </span>
              </div>
              <Badge className={getStatusColor(lobby.status)}>
                {getStatusText(lobby.status)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(lobby._creationTime, { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Game Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Map Type:</span>
            <span className="font-medium">
              {lobby.gameId ? "Game Started" : "Not Started"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Victory Points:</span>
            <span className="font-medium crypto-number">10</span>
          </div>
        </div>

        {/* Players */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Players</p>
          <div className="flex flex-wrap gap-1">
            {lobbyPlayers?.map((player, index) => (
              <Badge key={player._id} variant="secondary" className="text-xs">
                {player.isAI
                  ? `AI ${index + 1}`
                  : player.displayName || `Player ${index + 1}`}
                {player.isHost && <Crown className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
            {Array.from({
              length: Math.max(
                0,
                lobby.maxPlayers - (lobbyPlayers?.length || 0),
              ),
            }).map((_, index) => (
              <Badge
                key={`empty-${index}`}
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Empty
              </Badge>
            ))}
          </div>
        </div>

        {/* Host */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                H
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Host</p>
              <p className="text-xs text-muted-foreground">
                {lobby.hostId?.slice(0, 8)}...
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {isHost ? (
              <Button asChild size="sm" className="flex-1">
                <Link href={`/lobbies/${lobby._id}`}>
                  <Crown className="h-4 w-4 mr-2" />
                  Manage Lobby
                </Link>
              </Button>
            ) : currentUserInLobby ? (
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link href={`/lobbies/${lobby._id}`}>
                  <Users className="h-4 w-4 mr-2" />
                  In Lobby
                </Link>
              </Button>
            ) : canJoin ? (
              <Button asChild size="sm" className="flex-1">
                <Link href={`/lobbies/${lobby._id}`}>
                  <Users className="h-4 w-4 mr-2" />
                  Join Game
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled className="flex-1">
                {isFull
                  ? "Full"
                  : lobby.status !== "waiting"
                    ? "In Progress"
                    : isHost
                      ? "Your Lobby"
                      : "Closed"}
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Spectate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
