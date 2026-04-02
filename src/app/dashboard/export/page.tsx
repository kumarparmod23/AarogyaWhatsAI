"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Users, MessageSquare, Calendar, Megaphone, Star } from "lucide-react";
import { toast } from "sonner";

export default function ExportPage() {
  const [counts, setCounts] = useState({ patients: 0, messages: 0, appointments: 0, campaigns: 0, feedbacks: 0 });

  useEffect(() => {
    setCounts({
      patients: store.getPatients().length,
      messages: store.getMessages().length,
      appointments: store.getAppointments().length,
      campaigns: store.getCampaigns().length,
      feedbacks: store.getFeedbacks().length,
    });
  }, []);

  const downloadCSV = (type: "patients" | "messages" | "appointments" | "campaigns" | "feedbacks") => {
    const csv = store.exportToCSV(type);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aarogya_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${type} exported!`);
  };

  const exports = [
    { type: "patients" as const, label: "Patients", icon: Users, count: counts.patients, color: "text-blue-600", bg: "bg-blue-50" },
    { type: "messages" as const, label: "Messages", icon: MessageSquare, count: counts.messages, color: "text-green-600", bg: "bg-green-50" },
    { type: "appointments" as const, label: "Appointments", icon: Calendar, count: counts.appointments, color: "text-purple-600", bg: "bg-purple-50" },
    { type: "campaigns" as const, label: "Campaigns", icon: Megaphone, count: counts.campaigns, color: "text-orange-600", bg: "bg-orange-50" },
    { type: "feedbacks" as const, label: "Feedbacks", icon: Star, count: counts.feedbacks, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Export Data</h1>
      <p className="text-gray-500">Download your data as CSV files. All data is stored locally on your device.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exports.map((exp) => (
          <Card key={exp.type}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${exp.bg} rounded-lg flex items-center justify-center`}>
                  <exp.icon className={`w-6 h-6 ${exp.color}`} />
                </div>
                <div>
                  <p className="font-semibold">{exp.label}</p>
                  <p className="text-sm text-gray-500">{exp.count} records</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => downloadCSV(exp.type)} disabled={exp.count === 0}>
                <Download className="w-4 h-4 mr-1" /> CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
