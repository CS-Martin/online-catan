"use client";

import Link from "next/link";
import { ArrowLeft, Crown, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LobbyPageHeader({
  lobbyName,
  lobbyStatus,
  isPrivate,
  isHost,
  isDeleting,
  onEdit,
  onDelete,
}: {
  lobbyName: string;
  lobbyStatus: string;
  isPrivate: boolean;
  isHost: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "in_game":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "closed":
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Waiting for Players";
      case "in_game":
        return "Game In Progress";
      case "closed":
        return "Game Closed";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/lobbies">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lobbies
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight font-crypto">
            {lobbyName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge className={getStatusColor(lobbyStatus)}>
              {getStatusText(lobbyStatus)}
            </Badge>
            {isPrivate && <Badge variant="secondary">Private</Badge>}
            {isHost && (
              <Badge variant="outline" className="text-primary">
                <Crown className="h-3 w-3 mr-1" />
                Host
              </Badge>
            )}
          </div>
        </div>
      </div>

      {isHost && (
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <Button
            variant="outline"
            onClick={onEdit}
            className="w-full sm:w-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting lobby..." : "Delete lobby"}
          </Button>
        </div>
      )}
    </div>
  );
}
