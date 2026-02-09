"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getConvexErrorMessage } from "@/lib/convex-error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dice6, Users, Shield, Map, Crown, MapPin } from "lucide-react";

interface CreateLobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLobbyDialog({
  open,
  onOpenChange,
}: CreateLobbyDialogProps) {
  const { user } = useUser();
  const router = useRouter();
  const createLobby = useMutation(api.lobbies.api.createLobby);

  // Form state
  const [lobbyName, setLobbyName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState([4]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [mapType, setMapType] = useState("standard");
  const [victoryPoints, setVictoryPoints] = useState([10]);
  const [robberEnabled, setRobberEnabled] = useState(true);
  const [randomTerrain, setRandomTerrain] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lobbyName.trim()) return;

    try {
      const lobbyId = await createLobby({
        clerkId: user?.id || "",
        name: lobbyName.trim(),
        maxPlayers: maxPlayers[0],
        isPrivate,
      });

      toast.success("Lobby created");

      // Reset form and close dialog
      onOpenChange(false);
      setLobbyName("");
      setMaxPlayers([4]);
      setIsPrivate(false);
      setMapType("standard");
      setVictoryPoints([10]);
      setRobberEnabled(true);
      setRandomTerrain(false);

      // Redirect to lobby page
      router.push(`/lobbies/${lobbyId}`);
    } catch (error) {
      toast.error(getConvexErrorMessage(error));
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setLobbyName("");
    setMaxPlayers([4]);
    setIsPrivate(false);
    setMapType("standard");
    setVictoryPoints([10]);
    setRobberEnabled(true);
    setRandomTerrain(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-[#2a2a2a] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Dice6 className="h-5 w-5" />
            Create New Lobby
          </DialogTitle>
          <DialogDescription>
            Set up a new Catan game and invite players to join
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lobby Name */}
          <div className="space-y-2">
            <Label htmlFor="lobbyName">Lobby Name</Label>
            <Input
              id="lobbyName"
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
              placeholder="Enter lobby name..."
              maxLength={30}
              required
            />
          </div>

          {/* Player Count */}
          <div className="space-y-2">
            <Label htmlFor="maxPlayers">Max Players</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={maxPlayers}
                onValueChange={setMaxPlayers}
                min={2}
                max={4}
                step={1}
                className="flex-1"
              />
              <div className="crypto-number min-w-[3rem] text-center">
                {maxPlayers[0]}
              </div>
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="isPrivate" className="text-sm font-medium">
              Private Lobby
            </Label>
            <Switch
              id="isPrivate"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            {isPrivate && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                Invite Only
              </Badge>
            )}
          </div>

          {/* Game Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Game Settings</h3>

            <div className="grid gap-4">
              {/* Map Type */}
              <div className="space-y-2">
                <Label htmlFor="mapType">Map Type</Label>
                <Select value={mapType} onValueChange={setMapType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select map type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="seafarers">Seafarers</SelectItem>
                    <SelectItem value="cities">Cities & Knights</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Victory Points */}
              <div className="space-y-2">
                <Label htmlFor="victoryPoints">Victory Points</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={victoryPoints}
                    onValueChange={setVictoryPoints}
                    min={8}
                    max={12}
                    step={1}
                    className="flex-1"
                  />
                  <div className="crypto-number min-w-[3rem] text-center">
                    {victoryPoints[0]}
                  </div>
                </div>
              </div>

              {/* Robber Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="robberEnabled" className="text-sm font-medium">
                  Robber
                </Label>
                <Switch
                  id="robberEnabled"
                  checked={robberEnabled}
                  onCheckedChange={setRobberEnabled}
                />
              </div>

              {/* Random Terrain Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="randomTerrain" className="text-sm font-medium">
                  Random Terrain
                </Label>
                <Switch
                  id="randomTerrain"
                  checked={randomTerrain}
                  onCheckedChange={setRandomTerrain}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!lobbyName.trim()}>
              Create Lobby
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
