"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Calendar, TrendingUp, Send, UserPlus, Download, BarChart3, Heart, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [clinic, setClinic] = useState<any>(null);

  useEffect(() => {
    setStats(store.getAnalytics());
    setPatients(store.getPatients().slice(0, 5));
    setClinic(store.getClinic());
  }, []);

  if (!stats) return <div className="p-6 text-center">Loading...</div>;

  const statCards = [
    { label: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "New Today", value: stats.newLeadsToday, icon: UserPlus, color: "text-green-600", bg: "bg-green-50" },
    { label: "Appointments Today", value: stats.appointmentsToday, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active Chats", value: stats.activeConversations, icon: MessageSquare, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Response Rate", value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Booking Rate", value: `${stats.bookingRate}%`, icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Avg NPS", value: stats.avgNpsScore || "N/A", icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
    { label: "Total Messages", value: stats.totalMessages, icon: Send, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">{clinic?.clinicName || "Your Clinic"}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/patients"><Button variant="outline" size="sm"><UserPlus className="w-4 h-4 mr-1" /> Add Patient</Button></Link>
          <Link href="/dashboard/broadcast"><Button variant="whatsapp" size="sm"><Send className="w-4 h-4 mr-1" /> Broadcast</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Patients</CardTitle>
          <Link href="/dashboard/patients"><Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No patients yet.</p>
              <Link href="/dashboard/patients"><Button variant="whatsapp" size="sm" className="mt-3"><UserPlus className="w-4 h-4 mr-1" /> Add Patient</Button></Link>
            </div>
          ) : (
            <div className="divide-y">
              {patients.map((p) => (
                <Link key={p.id} href={`/dashboard/patients/${p.id}`} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded cursor-pointer block">
                  <div><p className="font-medium">{p.name || "Unknown"}</p><p className="text-sm text-gray-500">{p.phone}</p></div>
                  <span className={`text-xs px-2 py-1 rounded-full ${p.leadStatus === "NEW" ? "bg-blue-100 text-blue-700" : p.leadStatus === "CONVERTED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>{p.leadStatus}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
