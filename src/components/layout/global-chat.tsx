"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Users } from "lucide-react";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

export function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      username: "System",
      message: "Welcome to Global Chat! Be respectful and have fun.",
      timestamp: new Date(Date.now() - 300000),
      isSystem: true,
    },
    {
      id: "2", 
      username: "ProPlayer",
      message: "Looking for opponents in quick match!",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      username: "CatanMaster",
      message: "Anyone want to play a 4-player game?",
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: "4",
      username: "Newbie123",
      message: "How do I build a settlement?",
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: "5",
      username: "StrategyGuru",
      message: "Focus on getting brick and lumber early!",
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        username: "You", // In real app, this would be the actual username
        message: message.trim(),
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-30"
        size="icon"
      >
        <MessageCircle className="h-5 w-5" />
        {messages.length > 1 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
            {messages.length - 1}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 z-30">
      <Card className="h-full flex flex-col bg-surface border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            <span>Global Chat</span>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {Math.floor(Math.random() * 50) + 100}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`space-y-1 ${
                  msg.isSystem ? "text-center" : ""
                }`}
              >
                {!msg.isSystem && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-primary">
                      {msg.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )}
                <p
                  className={`text-sm ${
                    msg.isSystem
                      ? "text-muted-foreground italic"
                      : "text-foreground"
                  }`}
                >
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="border-t border-border p-3">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="h-9 w-9"
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
