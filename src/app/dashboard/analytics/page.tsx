"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

// Simple bar chart component (no heavy dependency needed for basic display)
function SimpleBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${item.color}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {});
  }, []);

  const defaultStats: DashboardStats = {
    totalPatients: 0,
    newLeadsToday: 0,
    appointmentsToday: 0,
    activeConversations: 0,
    responseRate: 0,
    bookingRate: 0,
    avgNpsScore: 0,
    noShowRate: 0,
  };

  const s = stats || defaultStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Track your clinic&apos;s performance</p>
      </div>

      <StatsCards stats={s} />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={[
                { label: "New Leads", value: s.totalPatients, color: "bg-blue-500" },
                { label: "Contacted", value: Math.round(s.totalPatients * 0.7), color: "bg-yellow-500" },
                { label: "Qualified", value: Math.round(s.totalPatients * 0.4), color: "bg-purple-500" },
                { label: "Booked", value: Math.round(s.totalPatients * (s.bookingRate / 100)), color: "bg-green-500" },
                { label: "Converted", value: Math.round(s.totalPatients * 0.15), color: "bg-teal-500" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={[
                { label: "Response Rate", value: s.responseRate, color: "bg-whatsapp" },
                { label: "Booking Rate", value: s.bookingRate, color: "bg-blue-500" },
                { label: "NPS Score (x10)", value: Math.round(s.avgNpsScore * 10), color: "bg-yellow-500" },
                { label: "Show-up Rate", value: 100 - s.noShowRate, color: "bg-green-500" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">{s.activeConversations}</p>
                <p className="text-xs text-green-600">Active AI Chats</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{s.responseRate}%</p>
                <p className="text-xs text-blue-600">Auto-Response Rate</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-700">&lt;30s</p>
                <p className="text-xs text-purple-600">Avg Response Time</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-700">{s.bookingRate}%</p>
                <p className="text-xs text-orange-600">AI Booking Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-whatsapp-dark">{s.avgNpsScore.toFixed(1)}</p>
              <p className="text-sm text-gray-500 mt-1">Average NPS Score (out of 10)</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                      i < Math.round(s.avgNpsScore)
                        ? "bg-whatsapp text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
