"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Calendar, TrendingUp, BarChart3, Heart, Send, AlertCircle } from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [statusDist, setStatusDist] = useState<Record<string, number>>({});

  useEffect(() => {
    setStats(store.getAnalytics());
    const patients = store.getPatients();
    const dist: Record<string, number> = {};
    patients.forEach((p) => { dist[p.leadStatus] = (dist[p.leadStatus] || 0) + 1; });
    setStatusDist(dist);
  }, []);

  if (!stats) return <div className="p-6">Loading...</div>;

  const cards = [
    { label: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-blue-600" },
    { label: "Total Messages", value: stats.totalMessages, icon: MessageSquare, color: "text-green-600" },
    { label: "Total Appointments", value: stats.totalAppointments, icon: Calendar, color: "text-purple-600" },
    { label: "Total Campaigns", value: stats.totalCampaigns, icon: Send, color: "text-orange-600" },
    { label: "Response Rate", value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-teal-600" },
    { label: "Booking Rate", value: `${stats.bookingRate}%`, icon: BarChart3, color: "text-indigo-600" },
    { label: "Avg NPS Score", value: stats.avgNpsScore || "N/A", icon: Heart, color: "text-pink-600" },
    { label: "No-Show Rate", value: `${stats.noShowRate}%`, icon: AlertCircle, color: "text-red-600" },
  ];

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-500", CONTACTED: "bg-yellow-500", QUALIFIED: "bg-green-500",
    APPOINTMENT_BOOKED: "bg-purple-500", CONVERTED: "bg-emerald-500",
    FOLLOW_UP: "bg-orange-500", LOST: "bg-red-500",
  };

  const totalPatients = Object.values(statusDist).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <c.icon className={`w-8 h-8 ${c.color}`} />
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-xl font-bold">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Lead Status Distribution</CardTitle></CardHeader>
        <CardContent>
          {totalPatients === 0 ? (
            <p className="text-gray-500">No patient data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusDist).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-32 text-sm font-medium">{status}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className={`h-full ${statusColors[status] || "bg-gray-500"} rounded-full flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max((count / totalPatients) * 100, 8)}%` }}>
                      <span className="text-xs text-white font-semibold">{count}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{Math.round((count / totalPatients) * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
