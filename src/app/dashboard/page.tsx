"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPhone, timeAgo, getLeadStatusColor } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {});

    fetch("/api/patients?take=5")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRecentPatients(d.data);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your clinic&apos;s WhatsApp automation</p>
      </div>

      <StatsCards stats={stats || defaultStats} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPatients.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No patients yet. They&apos;ll appear when they message your WhatsApp number.
              </p>
            ) : (
              <div className="space-y-3">
                {recentPatients.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-whatsapp/10 text-whatsapp-dark text-sm">
                        {p.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{formatPhone(p.phone)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getLeadStatusColor(p.leadStatus)}`}>
                      {p.leadStatus}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(p.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/dashboard/inbox"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-sm">Open Inbox</p>
              <p className="text-xs text-gray-500">View and respond to patient messages</p>
            </a>
            <a
              href="/dashboard/campaigns"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-sm">Create Campaign</p>
              <p className="text-xs text-gray-500">Send bulk reminders or follow-ups</p>
            </a>
            <a
              href="/dashboard/patients"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-sm">View All Patients</p>
              <p className="text-xs text-gray-500">Search and filter your patient database</p>
            </a>
            <a
              href="/dashboard/analytics"
              className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-sm">View Analytics</p>
              <p className="text-xs text-gray-500">Check performance metrics and trends</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
