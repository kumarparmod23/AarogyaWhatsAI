"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { MessageSquare } from "lucide-react";
import type { ChatConversation, ChatMessage } from "@/types";

export default function InboxPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        if (data.success) {
          setConversations(data.data);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load messages when conversation selected
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
      const interval = setInterval(() => loadMessages(selectedId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedId, loadMessages]);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  // Send a manual message
  const handleSendMessage = async (text: string) => {
    if (!selectedId || !selectedConv) return;

    try {
      await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedId,
          phone: selectedConv.patient.phone,
          content: text,
        }),
      });
      loadMessages(selectedId);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Takeover / handback
  const handleTakeover = async () => {
    if (!selectedId) return;
    await fetch(`/api/messages/send`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId, status: "HUMAN_TAKEOVER" }),
    });
    loadMessages(selectedId);
  };

  const handleHandbackToAI = async () => {
    if (!selectedId) return;
    await fetch(`/api/messages/send`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId, status: "AI_HANDLING" }),
    });
    loadMessages(selectedId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-lg border bg-white overflow-hidden -m-4 md:-m-6">
      {/* Conversation sidebar — hide on mobile when chat is open */}
      <div className={selectedId ? "hidden md:flex" : "flex w-full md:w-auto"}>
        <ChatSidebar
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Chat window */}
      {selectedId && selectedConv ? (
        <ChatWindow
          conversationId={selectedId}
          patientName={selectedConv.patient.name || selectedConv.patient.phone}
          patientPhone={selectedConv.patient.phone}
          status={selectedConv.status}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTakeover={handleTakeover}
          onHandbackToAI={handleHandbackToAI}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-3" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a patient from the left to view their chat</p>
          </div>
        </div>
      )}
    </div>
  );
}
