"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { store, ClinicConfig, ApiKeys } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Building2, Key, Rocket, ChevronRight, ChevronLeft, Check } from "lucide-react";

const STEPS = ["Welcome", "Clinic Info", "API Keys", "Ready!"];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [clinic, setClinic] = useState<ClinicConfig>({
    clinicName: "",
    doctorName: "",
    phone: "",
    address: "",
    specialization: "",
  });

  const [keys, setKeys] = useState<ApiKeys>({
    whatsappAccessToken: "",
    whatsappPhoneNumberId: "",
    whatsappAppSecret: "",
    whatsappVerifyToken: "aarogya-verify-" + Math.random().toString(36).slice(2, 8),
    aiProvider: "openai",
    aiApiKey: "",
  });

  const handleFinish = () => {
    store.setClinic(clinic);
    store.setApiKeys(keys);
    store.markSetupDone();
    router.push("/dashboard");
  };

  const handleSkip = () => {
    store.setClinic({ ...clinic, clinicName: clinic.clinicName || "My Clinic", doctorName: clinic.doctorName || "Doctor" });
    store.setApiKeys(keys);
    store.markSetupDone();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-whatsapp rounded-xl flex items-center justify-center mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <CardTitle className="text-2xl">AarogyaWhatsAI Setup</CardTitle>
          <CardDescription>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </CardDescription>

          {/* Progress bar */}
          <div className="flex gap-1 mt-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-whatsapp" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-4">
              <div className="text-6xl">🏥</div>
              <h3 className="text-lg font-semibold">Welcome, Doctor!</h3>
              <p className="text-sm text-gray-600">
                AarogyaWhatsAI aapki clinic ke liye WhatsApp automation platform hai.
                AI-powered conversations, patient management, appointment booking, follow-ups — sab automated!
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left text-sm">
                <p className="font-semibold text-green-800 mb-2">Kya milega:</p>
                <ul className="text-green-700 space-y-1">
                  <li>✅ AI chatbot Hindi/Hinglish mein</li>
                  <li>✅ Patient management & lead tracking</li>
                  <li>✅ Appointment booking & reminders</li>
                  <li>✅ Post-treatment follow-ups</li>
                  <li>✅ Bulk broadcast campaigns</li>
                  <li>✅ Analytics dashboard</li>
                  <li>✅ Data export (CSV)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 1: Clinic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-whatsapp" />
                <h3 className="font-semibold">Clinic Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Clinic Name *</label>
                  <Input
                    placeholder="e.g., Sharma Dental Clinic"
                    value={clinic.clinicName}
                    onChange={(e) => setClinic({ ...clinic, clinicName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Doctor Name *</label>
                  <Input
                    placeholder="e.g., Dr. Rajesh Sharma"
                    value={clinic.doctorName}
                    onChange={(e) => setClinic({ ...clinic, doctorName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <Input
                    placeholder="+91 9876543210"
                    value={clinic.phone}
                    onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Specialization</label>
                  <Input
                    placeholder="e.g., Dentist, Dermatologist, General"
                    value={clinic.specialization}
                    onChange={(e) => setClinic({ ...clinic, specialization: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <Input
                    placeholder="Clinic address"
                    value={clinic.address}
                    onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: API Keys */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-whatsapp" />
                <h3 className="font-semibold">API Configuration</h3>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                <p className="font-semibold">Optional — baad mein bhi Settings se configure kar sakte ho.</p>
                <p>API keys sirf aapke device pe store hoti hain, server pe nahi.</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 border-b pb-1">WhatsApp Business API</p>
                <div>
                  <label className="text-sm text-gray-600">Access Token</label>
                  <Input
                    type="password"
                    placeholder="Meta WhatsApp Cloud API token"
                    value={keys.whatsappAccessToken}
                    onChange={(e) => setKeys({ ...keys, whatsappAccessToken: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone Number ID</label>
                  <Input
                    placeholder="WhatsApp Business Phone Number ID"
                    value={keys.whatsappPhoneNumberId}
                    onChange={(e) => setKeys({ ...keys, whatsappPhoneNumberId: e.target.value })}
                  />
                </div>

                <p className="text-sm font-semibold text-gray-700 border-b pb-1 mt-4">AI Provider</p>
                <div>
                  <label className="text-sm text-gray-600">Provider</label>
                  <select
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={keys.aiProvider}
                    onChange={(e) => setKeys({ ...keys, aiProvider: e.target.value as any })}
                  >
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="grok">xAI (Grok)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">API Key</label>
                  <Input
                    type="password"
                    placeholder="AI provider API key"
                    value={keys.aiApiKey}
                    onChange={(e) => setKeys({ ...keys, aiApiKey: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <h3 className="text-lg font-semibold">Sab Set Hai!</h3>
              <p className="text-sm text-gray-600">
                Aapka AarogyaWhatsAI ready hai. Dashboard pe jaake patients add karein,
                messages bhejein, aur automation setup karein.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left text-sm">
                <p className="font-semibold text-green-800 mb-2">Quick Start:</p>
                <ol className="text-green-700 space-y-1 list-decimal list-inside">
                  <li>Dashboard pe patients add karein</li>
                  <li>Inbox se messages bhejein/receive karein</li>
                  <li>Campaigns se bulk broadcast bhejein</li>
                  <li>Analytics se performance track karein</li>
                  <li>Settings se API keys update karein kabhi bhi</li>
                </ol>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleSkip} className="text-gray-500">
                Skip Setup
              </Button>
            )}

            {step < STEPS.length - 1 ? (
              <Button variant="whatsapp" onClick={() => setStep(step + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="whatsapp" onClick={handleFinish}>
                <Rocket className="w-4 h-4 mr-1" /> Start Using
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
