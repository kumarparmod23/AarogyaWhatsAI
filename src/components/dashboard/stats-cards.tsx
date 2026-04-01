"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, MessageSquare, TrendingUp, Star, UserX } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalPatients: number;
    newLeadsToday: number;
    appointmentsToday: number;
    activeConversations: number;
    responseRate: number;
    bookingRate: number;
    avgNpsScore: number;
    noShowRate: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "New Leads Today",
      value: stats.newLeadsToday,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Appointments Today",
      value: stats.appointmentsToday,
      icon: CalendarCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Active Chats",
      value: stats.activeConversations,
      icon: MessageSquare,
      color: "text-whatsapp-dark",
      bg: "bg-whatsapp-light",
    },
    {
      title: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: MessageSquare,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Booking Rate",
      value: `${stats.bookingRate}%`,
      icon: CalendarCheck,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Avg NPS Score",
      value: stats.avgNpsScore.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "No-Show Rate",
      value: `${stats.noShowRate}%`,
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
