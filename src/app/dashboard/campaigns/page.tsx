"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store, Campaign } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Megaphone } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => { setCampaigns(store.getCampaigns()); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns ({campaigns.length})</h1>
        <Link href="/dashboard/broadcast"><Button variant="whatsapp"><Send className="w-4 h-4 mr-1" /> New Broadcast</Button></Link>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-3">No campaigns yet. Send your first broadcast!</p>
            <Link href="/dashboard/broadcast"><Button variant="whatsapp"><Send className="w-4 h-4 mr-1" /> Create Broadcast</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-gray-500">{c.templateName} • {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">Sent: {c.sent}</span>
                  <span className="text-red-500">Failed: {c.failed}</span>
                  <span className="text-gray-500">Total: {c.totalTargets}</span>
                  <span className={`px-2 py-1 rounded text-xs ${c.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{c.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
