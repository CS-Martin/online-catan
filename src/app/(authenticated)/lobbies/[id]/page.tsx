"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLobbyUserFacingError } from "@/lib/convex-error";

import { EditLobbyModal } from "@/components/lobby/edit-lobby-modal";
import { LobbyActionsSidebar } from "@/components/lobby/lobby-actions-sidebar";
import { LobbyMainContent } from "@/components/lobby/lobby-main-content";
import { LobbyPageHeader } from "@/components/lobby/lobby-page-header";
import { ColorSelectionModal } from "@/components/lobby/color-selection-modal";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const lobbyId = params.id as string;
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    maxPlayers: 4,
    isPrivate: false,
  });

  const lobby = useQuery(api.lobbies.api.getLobby, {
    lobbyId: lobbyId as any,
  });
  const lobbyPlayers = useQuery(api.lobbies.api.getLobbyPlayers, {
    lobbyId: lobbyId as any,
  });
  const joinLobby = useMutation(api.lobbies.api.joinLobby);
  const leaveLobby = useMutation(api.lobbies.api.leaveLobby);
  const setPlayerReady = useMutation(api.lobbies.api.setPlayerReady);
  const updateLobby = useMutation(api.lobbies.api.updateLobby);
  const deleteLobby = useMutation(api.lobbies.api.deleteLobby);
  const startGame = useMutation(api.lobbies.api.startGame);
  const isLoading = lobby === undefined || lobbyPlayers === undefined;

  // Redirect to game page when lobby transitions to in_game
  useEffect(() => {
    if (lobby?.status === "in_game" && lobby?.gameId) {
      router.push(`/games/${lobby.gameId}`);
    }
  }, [lobby?.status, lobby?.gameId, router]);

  const isHost = !!user?.id && lobby?.hostClerkId === user.id;
  const currentUserPlayer = lobbyPlayers?.find(
    (p: any) => !p.isAI && p.clerkId && user?.id && p.clerkId === user.id,
  );

  const handleJoinLobby = async () => {
    if (!user?.id || !lobbyId) return;

    setIsJoining(true);
    try {
      await joinLobby({
        clerkId: user.id,
        lobbyId: lobbyId as any,
      });
      toast.success("Joined lobby");
    } catch (error) {
      toast.error(getLobbyUserFacingError(error));
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartGame = async () => {
    if (!user?.id || !lobbyId) return;

    setIsStarting(true);
    try {
      const gameId = await startGame({
        clerkId: user.id,
        lobbyId: lobbyId as any,
      });
      toast.success("Color selection started");
    } catch (error) {
      toast.error(getLobbyUserFacingError(error));
      setIsStarting(false);
    }
  };

  useEffect(() => {
    if (lobby?.status === "in_game" && lobby.gameId) {
      router.push(`/games/${lobby.gameId}`);
    }
  }, [lobby?.status, lobby?.gameId, router]);

  const handleLeaveLobby = async () => {
    if (!user?.id || !lobbyId) return;

    try {
      await leaveLobby({
        clerkId: user.id,
        lobbyId: lobbyId as any,
      });

      toast.success("Left lobby");

      // Redirect back to lobbies list after leaving
      router.push("/lobbies");
    } catch (error) {
      toast.error(getLobbyUserFacingError(error));
    }
  };

  const handleToggleReady = async () => {
    if (!user?.id || !lobbyId || !currentUserPlayer) return;

    try {
      await setPlayerReady({
        clerkId: user.id,
        lobbyId: lobbyId as any,
        isReady: !currentUserPlayer.isReady,
      });
      toast.success(!currentUserPlayer.isReady ? "Ready" : "Not ready");
    } catch (error) {
      toast.error(getLobbyUserFacingError(error));
    }
  };

  const handleEditLobby = () => {
    if (!lobby) return;
    setEditForm({
      name: lobby.name,
      maxPlayers: lobby.maxPlayers,
      isPrivate: lobby.isPrivate,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!user?.id || !lobbyId) return;

    try {
      await updateLobby({
        clerkId: user.id,
        lobbyId: lobbyId as any,
        name: editForm.name.trim() || undefined,
        maxPlayers: editForm.maxPlayers,
        isPrivate: editForm.isPrivate,
      });
      setIsEditing(false);
      toast.success("Lobby updated");
    } catch (error) {
      toast.error(getLobbyUserFacingError(error));
    }
  };

  const handleDeleteLobby = async () => {
    if (!user?.id || !lobbyId) return;

    if (
      !confirm(
        "Are you sure you want to delete this lobby? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteLobby({
        clerkId: user.id,
        lobbyId: lobbyId as any,
      });
      toast.success("Lobby deleted");
      router.push("/lobbies");
    } catch (error) {
      toast.error(getLobbyUserFacingError(error));
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/lobbies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lobbies
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Crown className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lobby Not Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              The lobby you're looking for doesn't exist or has been closed.
            </p>
            <Button asChild className="mt-4">
              <Link href="/lobbies">Browse Lobbies</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <LobbyPageHeader
        lobbyName={lobby.name}
        lobbyStatus={lobby.status}
        isPrivate={lobby.isPrivate}
        isHost={isHost}
        isDeleting={isDeleting}
        onEdit={handleEditLobby}
        onDelete={handleDeleteLobby}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <LobbyMainContent
          maxPlayers={lobby.maxPlayers}
          lobbyPlayers={lobbyPlayers}
        />

        <LobbyActionsSidebar
          lobbyStatus={lobby.status}
          gameId={lobby.gameId}
          isPrivate={lobby.isPrivate}
          inviteCode={lobby.inviteCode}
          maxPlayers={lobby.maxPlayers}
          lobbyPlayers={lobbyPlayers}
          isHost={isHost}
          currentUserPlayer={currentUserPlayer}
          isJoining={isJoining}
          isStarting={isStarting}
          onJoin={handleJoinLobby}
          onLeave={handleLeaveLobby}
          onToggleReady={handleToggleReady}
          onStartGame={handleStartGame}
        />
      </div>

      <EditLobbyModal
        open={isEditing}
        form={editForm}
        onChange={setEditForm}
        onCancel={() => setIsEditing(false)}
        onSave={handleSaveEdit}
      />

      <ColorSelectionModal
        open={lobby.status === "color_selection"}
        lobbyId={lobbyId}
        lobbyPlayers={lobbyPlayers || []}
      />
    </div>
  );
}
