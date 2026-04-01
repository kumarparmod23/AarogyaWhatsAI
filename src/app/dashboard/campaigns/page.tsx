"use client";

import { useState, useEffect } from "react";
import { CampaignBuilder } from "@/components/campaigns/campaign-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (data.success) setCampaigns(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCampaign(formData: {
    name: string;
    templateName: string;
    targetStatus: string;
    scheduledAt: string | null;
  }) {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Campaign created successfully!");
        loadCampaigns();
      } else {
        toast.error(data.error || "Failed to create campaign");
      }
    } catch (err) {
      toast.error("Failed to create campaign");
    }
  }

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
    SENDING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <p className="text-sm text-gray-500 mt-1">Send bulk messages and scheduled broadcasts</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Campaign Builder */}
        <CampaignBuilder onSubmit={handleCreateCampaign} />

        {/* Campaign History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp" />
                </div>
              ) : campaigns.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No campaigns yet. Create your first campaign using the form.
                </p>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{campaign.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[campaign.status] || statusColor.DRAFT}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Template: {campaign.templateName || "N/A"}</span>
                        <span>Targets: {campaign.totalTargets}</span>
                        <span>Sent: {campaign.sent}</span>
                        <span>Failed: {campaign.failed}</span>
                      </div>
                      {campaign.scheduledAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Scheduled: {new Date(campaign.scheduledAt).toLocaleString("hi-IN")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
