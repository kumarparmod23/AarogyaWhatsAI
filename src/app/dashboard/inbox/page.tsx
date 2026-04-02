"use client";

import { useState, useEffect, useRef } from "react";
import { store, Patient, Message } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function InboxPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allMsgs = store.getMessages();
    const patientIds = [...new Set(allMsgs.map((m) => m.patientId))];
    const allPatients = store.getPatients();
    const withMsgs = allPatients.filter((p) => patientIds.includes(p.id));
    const withoutMsgs = allPatients.filter((p) => !patientIds.includes(p.id));
    setPatients([...withMsgs, ...withoutMsgs]);
  }, []);

  useEffect(() => {
    if (selectedId) {
      setMessages(store.getMessages(selectedId));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [selectedId]);

  const selectedPatient = patients.find((p) => p.id === selectedId);

  const sendMessage = async () => {
    if (!input.trim() || !selectedPatient) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    // Save outbound message locally
    store.addMessage({
      patientId: selectedPatient.id,
      direction: "OUTBOUND",
      sender: "HUMAN",
      content,
      messageType: "TEXT",
      status: "SENDING",
    });
    setMessages(store.getMessages(selectedPatient.id));

    // Send via WhatsApp API
    const keys = store.getApiKeys();
    if (keys.whatsappAccessToken && keys.whatsappPhoneNumberId) {
      try {
        const res = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wa-token": keys.whatsappAccessToken,
            "x-wa-phone-id": keys.whatsappPhoneNumberId,
          },
          body: JSON.stringify({ phone: selectedPatient.phone, message: content }),
        });
        const data = await res.json();
        if (data.success) toast.success("Message sent via WhatsApp");
        else toast.error(data.error || "Failed to send");
      } catch { toast.error("Network error"); }
    } else {
      toast.info("Message saved locally (WhatsApp API not configured)");
    }
    setSending(false);
  };

  const sendAiReply = async () => {
    if (!selectedPatient) return;
    setSending(true);
    const keys = store.getApiKeys();
    const clinic = store.getClinic();
    const recentMsgs = messages.slice(-10).map((m) => ({
      role: m.direction === "INBOUND" ? "user" : "assistant",
      content: m.content,
    }));

    if (!keys.aiApiKey) { toast.error("AI API key not configured. Go to Settings."); setSending(false); return; }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-provider": keys.aiProvider,
          "x-ai-key": keys.aiApiKey,
        },
        body: JSON.stringify({
          messages: recentMsgs,
          patientName: selectedPatient.name,
          clinicName: clinic.clinicName,
          doctorName: clinic.doctorName,
          specialization: clinic.specialization,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const aiMsg = data.data.response;
        store.addMessage({
          patientId: selectedPatient.id,
          direction: "OUTBOUND",
          sender: "AI",
          content: aiMsg,
          messageType: "TEXT",
          status: "SENT",
        });
        setMessages(store.getMessages(selectedPatient.id));

        // Also send via WhatsApp if configured
        if (keys.whatsappAccessToken && keys.whatsappPhoneNumberId) {
          await fetch("/api/whatsapp/send", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-wa-token": keys.whatsappAccessToken, "x-wa-phone-id": keys.whatsappPhoneNumberId },
            body: JSON.stringify({ phone: selectedPatient.phone, message: aiMsg }),
          });
        }
        toast.success("AI response sent");
      } else { toast.error(data.error); }
    } catch { toast.error("AI request failed"); }
    setSending(false);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Sidebar */}
      <div className={`${selectedId ? "hidden md:block" : ""} w-full md:w-80 border rounded-lg bg-white overflow-y-auto`}>
        <div className="p-3 border-b font-semibold text-gray-700">Patients ({patients.length})</div>
        {patients.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No patients. Add patients first.</p>
        ) : patients.map((p) => {
          const lastMsg = store.getMessages(p.id).slice(-1)[0];
          return (
            <div key={p.id} onClick={() => setSelectedId(p.id)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${selectedId === p.id ? "bg-green-50" : ""}`}>
              <p className="font-medium text-sm">{p.name || p.phone}</p>
              <p className="text-xs text-gray-500 truncate">{lastMsg?.content || "No messages"}</p>
            </div>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className={`${!selectedId ? "hidden md:flex" : "flex"} flex-1 flex-col border rounded-lg bg-white`}>
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a patient to start chatting</div>
        ) : (
          <>
            <div className="p-3 border-b flex items-center gap-3">
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedId(null)}><ArrowLeft className="w-4 h-4" /></Button>
              <div>
                <p className="font-semibold">{selectedPatient?.name || "Unknown"}</p>
                <p className="text-xs text-gray-500">{selectedPatient?.phone}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] p-3 rounded-lg text-sm ${m.direction === "OUTBOUND" ? m.sender === "AI" ? "bg-blue-100 text-blue-900" : "bg-green-100 text-green-900" : "bg-white border"}`}>
                    <p className="text-xs mb-1 opacity-60">{m.sender} • {new Date(m.createdAt).toLocaleTimeString()}</p>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t flex gap-2">
              <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} disabled={sending} />
              <Button variant="whatsapp" onClick={sendMessage} disabled={sending || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={sendAiReply} disabled={sending} title="Generate AI reply">
                <Bot className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
