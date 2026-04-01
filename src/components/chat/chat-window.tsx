"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, UserCog, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface ChatWindowProps {
  conversationId: string;
  patientName: string;
  patientPhone: string;
  status: string;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onTakeover: () => void;
  onHandbackToAI: () => void;
  onBack?: () => void;
}

export function ChatWindow({
  conversationId,
  patientName,
  patientPhone,
  status,
  messages,
  onSendMessage,
  onTakeover,
  onHandbackToAI,
  onBack,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzAwMDAwMDA4Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI3ApIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')]">
      {/* Chat header */}
      <div className="bg-whatsapp-dark text-white px-4 py-3 flex items-center gap-3 shrink-0">
        {onBack && (
          <button onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-white/20 text-white text-sm">
            {patientName?.charAt(0)?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{patientName || patientPhone}</h3>
          <p className="text-xs text-white/70">{patientPhone}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "text-xs",
              status === "AI_HANDLING"
                ? "bg-green-500/20 text-green-100"
                : "bg-blue-500/20 text-blue-100"
            )}
          >
            {status === "AI_HANDLING" ? "AI" : "Manual"}
          </Badge>
          {status === "AI_HANDLING" ? (
            <Button size="sm" variant="outline" className="text-xs h-7 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={onTakeover}>
              <UserCog className="h-3 w-3 mr-1" /> Takeover
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="text-xs h-7 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={onHandbackToAI}>
              <Bot className="h-3 w-3 mr-1" /> AI Mode
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-2 max-w-3xl mx-auto">
          {messages.map((msg) => {
            const isOutbound = msg.direction === "OUTBOUND";

            return (
              <div
                key={msg.id}
                className={cn("flex", isOutbound ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 shadow-sm",
                    isOutbound
                      ? "bg-[#DCF8C6] text-gray-900"
                      : "bg-white text-gray-900"
                  )}
                >
                  {/* Sender indicator */}
                  {isOutbound && (
                    <div className="flex items-center gap-1 mb-1">
                      {msg.sender === "AI" ? (
                        <Bot className="h-3 w-3 text-whatsapp-dark" />
                      ) : (
                        <User className="h-3 w-3 text-blue-500" />
                      )}
                      <span className="text-[10px] font-medium text-gray-500">
                        {msg.sender === "AI" ? "AI Bot" : "Doctor"}
                      </span>
                    </div>
                  )}

                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>

                  <p className="text-[10px] text-gray-400 text-right mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString("hi-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="bg-white px-4 py-3 border-t shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Input
            placeholder={
              status === "AI_HANDLING"
                ? "AI is handling this chat... (Take over to reply)"
                : "Type a message..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={status === "AI_HANDLING"}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || status === "AI_HANDLING"}
            variant="whatsapp"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
