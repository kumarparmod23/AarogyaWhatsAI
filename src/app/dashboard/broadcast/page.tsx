"use client";

import { useState, useEffect } from "react";
import { store, Patient } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users, CheckCircle, AlertCircle, Filter } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["ALL", "NEW", "CONTACTED", "QUALIFIED", "APPOINTMENT_BOOKED", "CONVERTED", "FOLLOW_UP"];

export default function BroadcastPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("Namaste {{name}}! \n\n");
  const [templateName, setTemplateName] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => { setPatients(store.getPatients()); }, []);

  const filtered = patients.filter((p) => statusFilter === "ALL" || p.leadStatus === statusFilter);

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleSend = async () => {
    if (selected.size === 0) { toast.error("Select at least one patient"); return; }
    if (!useTemplate && !message.trim()) { toast.error("Write a message"); return; }
    if (useTemplate && !templateName.trim()) { toast.error("Enter template name"); return; }

    const keys = store.getApiKeys();
    if (!keys.whatsappAccessToken || !keys.whatsappPhoneNumberId) {
      toast.error("WhatsApp API keys not configured. Go to Settings.");
      return;
    }

    setSending(true);
    setResult(null);

    const recipients = patients
      .filter((p) => selected.has(p.id))
      .map((p) => ({ phone: p.phone, name: p.name || "Patient" }));

    try {
      const res = await fetch("/api/whatsapp/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wa-token": keys.whatsappAccessToken,
          "x-wa-phone-id": keys.whatsappPhoneNumberId,
        },
        body: JSON.stringify({
          recipients,
          message: useTemplate ? undefined : message,
          templateName: useTemplate ? templateName : undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setResult(data.data);
        // Save campaign locally
        store.addCampaign({
          name: `Broadcast ${new Date().toLocaleDateString()}`,
          templateName: useTemplate ? templateName : "Freeform",
          message: useTemplate ? templateName : message.slice(0, 100),
          targetFilter: statusFilter,
          status: "COMPLETED",
          totalTargets: recipients.length,
          sent: data.data.sent,
          failed: data.data.failed,
        });
        // Save messages locally
        recipients.forEach((r) => {
          const patient = patients.find((p) => p.phone === r.phone);
          if (patient) {
            store.addMessage({
              patientId: patient.id,
              direction: "OUTBOUND",
              sender: "HUMAN",
              content: useTemplate ? `[Template: ${templateName}]` : message.replace("{{name}}", r.name),
              messageType: "TEXT",
              status: "SENT",
            });
          }
        });
        toast.success(`Broadcast complete! Sent: ${data.data.sent}, Failed: ${data.data.failed}`);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Broadcast failed. Check your API keys.");
    }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bulk Broadcast</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Message Composer */}
        <Card>
          <CardHeader><CardTitle className="text-base">Compose Message</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant={!useTemplate ? "whatsapp" : "outline"} size="sm" onClick={() => setUseTemplate(false)}>Freeform Text</Button>
              <Button variant={useTemplate ? "whatsapp" : "outline"} size="sm" onClick={() => setUseTemplate(true)}>Template</Button>
            </div>

            {useTemplate ? (
              <Input placeholder="Template name (e.g. appointment_reminder)" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            ) : (
              <>
                <textarea className="w-full border rounded-lg p-3 text-sm min-h-[150px]" placeholder="Write your message... Use {{name}} for patient name"
                  value={message} onChange={(e) => setMessage(e.target.value)} />
                <p className="text-xs text-gray-500">Use {"{{name}}"} to personalize. E.g. &quot;Namaste {"{{name}}"}!&quot;</p>
              </>
            )}

            {/* Preview */}
            {!useTemplate && message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-green-800 mb-1">Preview:</p>
                <p className="text-sm text-green-700 whitespace-pre-wrap">{message.replace("{{name}}", "Rajesh")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Select Recipients ({selected.size})</CardTitle>
              <div className="flex gap-2 items-center">
                <Filter className="w-4 h-4 text-gray-400" />
                <select className="border rounded px-2 py-1 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setSelected(new Set()); }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {selected.size === filtered.length ? "Deselect All" : "Select All"} ({filtered.length})
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filtered.length === 0 ? <p className="text-sm text-gray-500">No patients match filter</p> :
                filtered.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="rounded" />
                    <span className="text-sm font-medium">{p.name || "—"}</span>
                    <span className="text-xs text-gray-500">{p.phone}</span>
                  </label>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Send Button */}
      <div className="flex items-center gap-4">
        <Button variant="whatsapp" size="lg" onClick={handleSend} disabled={sending || selected.size === 0}>
          <Send className="w-4 h-4 mr-2" />
          {sending ? "Sending..." : `Send to ${selected.size} patients`}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-green-700"><CheckCircle className="w-5 h-5" /> Sent: {result.sent}</div>
              <div className="flex items-center gap-2 text-red-600"><AlertCircle className="w-5 h-5" /> Failed: {result.failed}</div>
              <div className="flex items-center gap-2 text-gray-600"><Users className="w-5 h-5" /> Total: {result.total}</div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-3 text-sm text-red-600">
                <p className="font-semibold">Errors:</p>
                {result.errors.map((e: string, i: number) => <p key={i} className="text-xs">{e}</p>)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
