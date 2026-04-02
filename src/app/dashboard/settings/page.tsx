"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { store, ClinicConfig, ApiKeys } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Trash2, RotateCcw, Building2, Key, Globe } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"clinic" | "api" | "webhook">("clinic");
  const [clinic, setClinic] = useState<ClinicConfig>(store.getClinic());
  const [keys, setKeys] = useState<ApiKeys>(store.getApiKeys());

  useEffect(() => {
    setClinic(store.getClinic());
    setKeys(store.getApiKeys());
  }, []);

  const saveClinic = () => { store.setClinic(clinic); toast.success("Clinic info saved!"); };
  const saveKeys = () => { store.setApiKeys(keys); toast.success("API keys saved!"); };

  const clearAll = () => {
    if (confirm("Are you sure? This will delete ALL data (patients, messages, campaigns, etc). This cannot be undone!")) {
      store.clearAll();
      toast.success("All data cleared");
      router.push("/setup");
    }
  };

  const rerunSetup = () => {
    if (confirm("Re-run setup wizard?")) {
      localStorage.removeItem("aarogya_setup_done");
      router.push("/setup");
    }
  };

  const webhookUrl = typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/whatsapp` : "";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-2 border-b pb-2">
        {[
          { id: "clinic" as const, label: "Clinic", icon: Building2 },
          { id: "api" as const, label: "API Keys", icon: Key },
          { id: "webhook" as const, label: "Webhook", icon: Globe },
        ].map((t) => (
          <Button key={t.id} variant={tab === t.id ? "whatsapp" : "ghost"} size="sm" onClick={() => setTab(t.id)}>
            <t.icon className="w-4 h-4 mr-1" /> {t.label}
          </Button>
        ))}
      </div>

      {tab === "clinic" && (
        <Card>
          <CardHeader><CardTitle>Clinic Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-sm text-gray-600">Clinic Name</label><Input value={clinic.clinicName} onChange={(e) => setClinic({ ...clinic, clinicName: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">Doctor Name</label><Input value={clinic.doctorName} onChange={(e) => setClinic({ ...clinic, doctorName: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">Phone</label><Input value={clinic.phone} onChange={(e) => setClinic({ ...clinic, phone: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">Specialization</label><Input value={clinic.specialization} onChange={(e) => setClinic({ ...clinic, specialization: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="text-sm text-gray-600">Address</label><Input value={clinic.address} onChange={(e) => setClinic({ ...clinic, address: e.target.value })} /></div>
            </div>
            <Button variant="whatsapp" onClick={saveClinic}><Save className="w-4 h-4 mr-1" /> Save Clinic Info</Button>
          </CardContent>
        </Card>
      )}

      {tab === "api" && (
        <Card>
          <CardHeader><CardTitle>API Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              API keys sirf aapke device pe store hoti hain. Server pe kabhi nahi bhejti.
            </div>

            <p className="font-semibold border-b pb-1">WhatsApp Business API</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-sm text-gray-600">Access Token</label><Input type="password" value={keys.whatsappAccessToken} onChange={(e) => setKeys({ ...keys, whatsappAccessToken: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">Phone Number ID</label><Input value={keys.whatsappPhoneNumberId} onChange={(e) => setKeys({ ...keys, whatsappPhoneNumberId: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">App Secret (optional)</label><Input type="password" value={keys.whatsappAppSecret} onChange={(e) => setKeys({ ...keys, whatsappAppSecret: e.target.value })} /></div>
              <div><label className="text-sm text-gray-600">Verify Token</label><Input value={keys.whatsappVerifyToken} onChange={(e) => setKeys({ ...keys, whatsappVerifyToken: e.target.value })} /></div>
            </div>

            <p className="font-semibold border-b pb-1 mt-4">AI Provider</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Provider</label>
                <select className="w-full border rounded px-3 py-2 text-sm" value={keys.aiProvider} onChange={(e) => setKeys({ ...keys, aiProvider: e.target.value as any })}>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="grok">xAI (Grok)</option>
                </select>
              </div>
              <div><label className="text-sm text-gray-600">API Key</label><Input type="password" value={keys.aiApiKey} onChange={(e) => setKeys({ ...keys, aiApiKey: e.target.value })} /></div>
            </div>

            <Button variant="whatsapp" onClick={saveKeys}><Save className="w-4 h-4 mr-1" /> Save API Keys</Button>
          </CardContent>
        </Card>
      )}

      {tab === "webhook" && (
        <Card>
          <CardHeader><CardTitle>WhatsApp Webhook Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Webhook URL (paste this in Meta Developer Dashboard)</label>
              <div className="flex gap-2 mt-1">
                <Input readOnly value={webhookUrl} />
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success("Copied!"); }}>Copy</Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Verify Token</label>
              <Input readOnly value={keys.whatsappVerifyToken} />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-semibold mb-1">Setup Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to Meta Developer Dashboard → WhatsApp → Configuration</li>
                <li>Set Webhook URL to the URL above</li>
                <li>Set Verify Token to your verify token</li>
                <li>Subscribe to &quot;messages&quot; webhook field</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-red-600">Danger Zone</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" onClick={rerunSetup}><RotateCcw className="w-4 h-4 mr-1" /> Re-run Setup</Button>
          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={clearAll}><Trash2 className="w-4 h-4 mr-1" /> Clear All Data</Button>
        </CardContent>
      </Card>
    </div>
  );
}
