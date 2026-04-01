"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Send, Clock } from "lucide-react";

interface CampaignBuilderProps {
  onSubmit: (data: {
    name: string;
    templateName: string;
    targetStatus: string;
    scheduledAt: string | null;
  }) => void;
}

export function CampaignBuilder({ onSubmit }: CampaignBuilderProps) {
  const [name, setName] = useState("");
  const [templateName, setTemplateName] = useState("welcome_message");
  const [targetStatus, setTargetStatus] = useState("ALL");
  const [scheduleType, setScheduleType] = useState<"now" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      templateName,
      targetStatus,
      scheduledAt: scheduleType === "scheduled" ? scheduledAt : null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Campaign</CardTitle>
        <CardDescription>Send bulk messages to your patients</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Campaign Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Check-up Reminder"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Message Template</label>
            <select
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="welcome_message">Welcome Message</option>
              <option value="appointment_reminder">Appointment Reminder</option>
              <option value="post_treatment_day1">Post-Treatment Day 1</option>
              <option value="feedback_request">Feedback Request</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Target Patients</label>
            <select
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ALL">All Patients</option>
              <option value="NEW">New Leads</option>
              <option value="CONTACTED">Contacted</option>
              <option value="HOT">Hot Leads</option>
              <option value="FOLLOW_UP">Follow-up Required</option>
              <option value="VISITED">Visited</option>
              <option value="CONVERTED">Converted</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Send Time</label>
            <div className="flex gap-3 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="now"
                  checked={scheduleType === "now"}
                  onChange={() => setScheduleType("now")}
                  className="accent-whatsapp"
                />
                <span className="text-sm">Send Now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="scheduled"
                  checked={scheduleType === "scheduled"}
                  onChange={() => setScheduleType("scheduled")}
                  className="accent-whatsapp"
                />
                <span className="text-sm">Schedule</span>
              </label>
            </div>
            {scheduleType === "scheduled" && (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-2"
                required
              />
            )}
          </div>

          <Button type="submit" variant="whatsapp" className="w-full">
            {scheduleType === "now" ? (
              <>
                <Send className="h-4 w-4 mr-2" /> Send Campaign
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" /> Schedule Campaign
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
