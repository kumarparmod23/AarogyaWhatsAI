"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store, Patient } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["ALL", "NEW", "CONTACTED", "QUALIFIED", "APPOINTMENT_BOOKED", "CONVERTED", "FOLLOW_UP", "LOST"];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", age: "", gender: "", city: "", language: "HINDI", leadStatus: "NEW" });

  useEffect(() => { setPatients(store.getPatients()); }, []);

  const filtered = patients.filter((p) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search);
    const matchStatus = statusFilter === "ALL" || p.leadStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    if (!form.phone.trim()) { toast.error("Phone number required"); return; }
    if (store.findPatientByPhone(form.phone)) { toast.error("Patient with this phone already exists"); return; }
    store.addPatient({
      phone: form.phone.trim(),
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : undefined,
      gender: form.gender || undefined,
      city: form.city || undefined,
      language: form.language,
      leadStatus: form.leadStatus,
      tags: [],
      consentGiven: false,
      email: undefined,
      medicalNotes: undefined,
    });
    setPatients(store.getPatients());
    setForm({ name: "", phone: "", age: "", gender: "", city: "", language: "HINDI", leadStatus: "NEW" });
    setShowForm(false);
    toast.success("Patient added!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this patient?")) {
      store.deletePatient(id);
      setPatients(store.getPatients());
      toast.success("Patient deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients ({patients.length})</h1>
        <Button variant="whatsapp" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="w-4 h-4 mr-1" /> Cancel</> : <><UserPlus className="w-4 h-4 mr-1" /> Add Patient</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Phone * (e.g. +919876543210)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              <select className="border rounded px-3 py-2 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <select className="border rounded px-3 py-2 text-sm" value={form.leadStatus} onChange={(e) => setForm({ ...form, leadStatus: e.target.value })}>
                {STATUSES.filter(s => s !== "ALL").map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button variant="whatsapp" onClick={handleAdd} className="col-span-2 md:col-span-1">Save Patient</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search name or phone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border rounded px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3 hidden md:table-cell">Age</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3 hidden md:table-cell">Created</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">No patients found</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium"><Link href={`/dashboard/patients/${p.id}`} className="hover:text-whatsapp">{p.name || "—"}</Link></td>
                    <td className="p-3 text-gray-600">{p.phone}</td>
                    <td className="p-3 text-gray-600 hidden md:table-cell">{p.age || "—"}</td>
                    <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${p.leadStatus === "NEW" ? "bg-blue-100 text-blue-700" : p.leadStatus === "CONVERTED" ? "bg-emerald-100 text-emerald-700" : p.leadStatus === "APPOINTMENT_BOOKED" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>{p.leadStatus}</span></td>
                    <td className="p-3 text-gray-500 hidden md:table-cell">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Link href={`/dashboard/patients/${p.id}`}><Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button></Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
