"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users, Gamepad2 } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  const actions = [
    {
      title: "Create Lobby",
      description: "Start a new game and invite friends",
      icon: Plus,
      href: "/lobbies/create",
      variant: "default" as const,
    },
    {
      title: "Find Game",
      description: "Browse available lobbies to join",
      icon: Search,
      href: "/lobbies",
      variant: "outline" as const,
    },
    {
      title: "Quick Match",
      description: "Get matched with players instantly",
      icon: Users,
      href: "/play",
      variant: "outline" as const,
    },
    {
      title: "Practice",
      description: "Play against AI to improve skills",
      icon: Gamepad2,
      href: "/practice",
      variant: "outline" as const,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {actions.map((action, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <action.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
              <Button asChild variant={action.variant} className="w-full">
                <Link href={action.href}>
                  {action.title === "Create Lobby" && "Create"}
                  {action.title === "Find Game" && "Browse"}
                  {action.title === "Quick Match" && "Play"}
                  {action.title === "Practice" && "Practice"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
