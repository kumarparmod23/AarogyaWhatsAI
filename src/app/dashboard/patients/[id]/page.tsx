"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { store, Patient, Message, Appointment } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, MessageSquare, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Patient>>({});

  useEffect(() => {
    const p = store.getPatient(id);
    if (p) { setPatient(p); setForm(p); }
    setMessages(store.getMessages(id));
    setAppointments(store.getAppointments(id));
  }, [id]);

  if (!patient) return <div className="p-6 text-center text-gray-500">Patient not found</div>;

  const handleSave = () => {
    store.updatePatient(id, form);
    setPatient(store.getPatient(id) || null);
    setEditing(false);
    toast.success("Patient updated!");
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{patient.name || patient.phone}</CardTitle>
          <Button variant={editing ? "whatsapp" : "outline"} size="sm" onClick={editing ? handleSave : () => setEditing(true)}>
            {editing ? <><Save className="w-4 h-4 mr-1" /> Save</> : "Edit"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Name", key: "name" },
              { label: "Phone", key: "phone" },
              { label: "Age", key: "age" },
              { label: "Gender", key: "gender" },
              { label: "City", key: "city" },
              { label: "Lead Status", key: "leadStatus" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-500">{f.label}</label>
                {editing ? (
                  <Input value={(form as any)[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                ) : (
                  <p className="font-medium">{(patient as any)[f.key] || "—"}</p>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <div className="mt-4">
              <label className="text-xs text-gray-500">Medical Notes</label>
              <textarea className="w-full border rounded p-2 text-sm mt-1" rows={3} value={form.medicalNotes || ""} onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Messages ({messages.length})</CardTitle></CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            {messages.length === 0 ? <p className="text-gray-500 text-sm">No messages yet</p> :
              messages.slice(-20).map((m) => (
                <div key={m.id} className={`mb-2 p-2 rounded text-sm ${m.direction === "INBOUND" ? "bg-gray-100" : "bg-green-50"}`}>
                  <span className="text-xs text-gray-500">{m.sender} • {new Date(m.createdAt).toLocaleTimeString()}</span>
                  <p>{m.content}</p>
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4" /> Appointments ({appointments.length})</CardTitle></CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            {appointments.length === 0 ? <p className="text-gray-500 text-sm">No appointments</p> :
              appointments.map((a) => (
                <div key={a.id} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                  <p className="font-medium">{new Date(a.dateTime).toLocaleString()}</p>
                  <p className="text-gray-500">{a.type || "General"} • {a.status}</p>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
