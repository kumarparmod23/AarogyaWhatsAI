"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPhone, getLeadStatusColor, getLeadStatusLabel, timeAgo } from "@/lib/utils";
import { MessageSquare, Eye } from "lucide-react";
import Link from "next/link";

interface Patient {
  id: string;
  phone: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  leadStatus: string;
  tags: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
  _count?: { conversations: number };
}

interface PatientTableProps {
  patients: Patient[];
}

export function PatientTable({ patients }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No patients found</p>
        <p className="text-sm mt-1">Patients will appear here when they message your WhatsApp number</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-gray-500">
            <th className="pb-3 pl-4 font-medium">Patient</th>
            <th className="pb-3 font-medium hidden sm:table-cell">Phone</th>
            <th className="pb-3 font-medium hidden md:table-cell">Age/Gender</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium hidden lg:table-cell">Language</th>
            <th className="pb-3 font-medium hidden lg:table-cell">Last Active</th>
            <th className="pb-3 pr-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="py-3 pl-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-whatsapp/10 text-whatsapp-dark text-xs">
                      {patient.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {patient.name || "Unknown"}
                  </span>
                </div>
              </td>
              <td className="py-3 text-sm text-gray-600 hidden sm:table-cell">
                {formatPhone(patient.phone)}
              </td>
              <td className="py-3 text-sm text-gray-600 hidden md:table-cell">
                {patient.age ? `${patient.age}y` : "-"}{" "}
                {patient.gender ? `/ ${patient.gender.charAt(0)}` : ""}
              </td>
              <td className="py-3">
                <span className={`text-xs px-2 py-1 rounded-full ${getLeadStatusColor(patient.leadStatus)}`}>
                  {getLeadStatusLabel(patient.leadStatus)}
                </span>
              </td>
              <td className="py-3 text-sm text-gray-600 hidden lg:table-cell">
                {patient.language}
              </td>
              <td className="py-3 text-sm text-gray-500 hidden lg:table-cell">
                {timeAgo(patient.updatedAt)}
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-1">
                  <Link href={`/dashboard/patients/${patient.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/inbox?patient=${patient.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
