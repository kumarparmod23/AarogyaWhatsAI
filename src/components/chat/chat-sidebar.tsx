"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Bot, User } from "lucide-react";
import { cn, timeAgo, formatPhone, getLeadStatusColor } from "@/lib/utils";
import type { ChatConversation } from "@/types";

interface ChatSidebarProps {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChatSidebar({ conversations, selectedId, onSelect }: ChatSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.patient.name?.toLowerCase().includes(q) ||
      c.patient.phone.includes(q)
    );
  });

  return (
    <div className="w-full md:w-80 border-r flex flex-col bg-white">
      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No conversations found
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-b text-left",
                selectedId === conv.id && "bg-whatsapp/5"
              )}
            >
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-whatsapp/20 text-whatsapp-dark text-sm">
                  {conv.patient.name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm truncate">
                    {conv.patient.name || formatPhone(conv.patient.phone)}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {timeAgo(conv.updatedAt)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {conv.lastMessage?.content || "No messages yet"}
                </p>

                <div className="flex items-center gap-1.5 mt-1">
                  {conv.status === "AI_HANDLING" ? (
                    <Bot className="h-3 w-3 text-whatsapp" />
                  ) : (
                    <User className="h-3 w-3 text-blue-500" />
                  )}
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-full", getLeadStatusColor(conv.patient.leadStatus))}>
                    {conv.patient.leadStatus}
                  </span>
                  {conv.unreadCount > 0 && (
                    <Badge className="ml-auto bg-whatsapp text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
