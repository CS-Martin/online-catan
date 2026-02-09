"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EditLobbyModal({
  open,
  form,
  onChange,
  onCancel,
  onSave,
}: {
  open: boolean;
  form: { name: string; maxPlayers: number; isPrivate: boolean };
  onChange: (next: { name: string; maxPlayers: number; isPrivate: boolean }) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Lobby</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Lobby Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="Enter lobby name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Max Players</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={form.maxPlayers}
              onChange={(e) =>
                onChange({ ...form, maxPlayers: Number(e.target.value) })
              }
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={form.isPrivate}
              onChange={(e) => onChange({ ...form, isPrivate: e.target.checked })}
            />
            <label htmlFor="isPrivate" className="text-sm font-medium">
              Private Lobby
            </label>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
