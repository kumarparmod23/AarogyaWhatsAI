"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPhone, getLeadStatusColor, getLeadStatusLabel } from "@/lib/utils";
import { Phone, Mail, MapPin, Calendar, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PatientDetailPage() {
  const params = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/patients/${params.id}`);
        const data = await res.json();
        if (data.success) setPatient(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp" />
      </div>
    );
  }

  if (!patient) {
    return <div className="text-center py-20 text-gray-500">Patient not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Patient Details</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-16 w-16 mb-3">
                <AvatarFallback className="bg-whatsapp/10 text-whatsapp-dark text-xl">
                  {patient.name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold">{patient.name || "Unknown"}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full mt-1 ${getLeadStatusColor(patient.leadStatus)}`}>
                {getLeadStatusLabel(patient.leadStatus)}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{formatPhone(patient.phone)}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.city && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{patient.city}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Joined {new Date(patient.createdAt).toLocaleDateString("hi-IN")}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-1">
              {patient.age && <Badge variant="outline">Age: {patient.age}</Badge>}
              {patient.gender && <Badge variant="outline">{patient.gender}</Badge>}
              <Badge variant="outline">{patient.language}</Badge>
              {patient.consentGiven && <Badge className="bg-green-100 text-green-800">Consent Given</Badge>}
            </div>

            <div className="mt-6">
              <Link href={`/dashboard/inbox?patient=${patient.id}`}>
                <Button variant="whatsapp" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" /> Open Chat
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Details Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="notes">
            <TabsList>
              <TabsTrigger value="notes">Medical Notes</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medical Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {patient.medicalNotes || "No medical notes recorded yet."}
                  </p>
                  {patient.lastConversation && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">AI Summary</h4>
                      <p className="text-sm text-blue-700">{patient.lastConversation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversations">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversation History</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.conversations?.length > 0 ? (
                    <div className="space-y-3">
                      {patient.conversations.map((conv: any) => (
                        <div key={conv.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline">{conv.flowType || "General"}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(conv.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{conv.aiSummary || `${conv._count?.messages || 0} messages`}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No conversations yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.appointments?.length > 0 ? (
                    <div className="space-y-3">
                      {patient.appointments.map((apt: any) => (
                        <div key={apt.id} className="p-3 border rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(apt.dateTime).toLocaleDateString("hi-IN", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(apt.dateTime).toLocaleTimeString("hi-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {apt.type ? ` - ${apt.type}` : ""}
                            </p>
                          </div>
                          <Badge variant={apt.status === "COMPLETED" ? "default" : "outline"}>
                            {apt.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No appointments scheduled</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
