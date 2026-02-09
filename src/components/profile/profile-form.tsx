"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileFormProps {
  userProfile: any;
  onSave: (data: { displayName?: string }) => void;
  onCancel: () => void;
}

export function ProfileForm({ userProfile, onSave, onCancel }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName: displayName.trim() || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          maxLength={30}
        />
        <p className="text-xs text-muted-foreground">
          This is how other players will see you in-game
        </p>
      </div>
      <div className="flex space-x-2 pt-4">
        <Button type="submit" disabled={!displayName.trim()}>
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
