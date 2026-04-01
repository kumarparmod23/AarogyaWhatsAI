"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your WhatsApp automation</p>
      </div>

      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="clinic">Clinic Info</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business API</CardTitle>
              <CardDescription>Configure your Meta WhatsApp Business Cloud API connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Phone Number ID</label>
                <Input placeholder="Your WhatsApp Phone Number ID" defaultValue={process.env.NEXT_PUBLIC_WA_PHONE_ID || ""} />
              </div>
              <div>
                <label className="text-sm font-medium">Business Account ID</label>
                <Input placeholder="Your WhatsApp Business Account ID" />
              </div>
              <div>
                <label className="text-sm font-medium">Access Token</label>
                <Input type="password" placeholder="Your permanent access token" />
              </div>
              <div>
                <label className="text-sm font-medium">Webhook Verify Token</label>
                <Input placeholder="Custom verification token" />
                <p className="text-xs text-gray-500 mt-1">
                  Webhook URL: <code className="bg-gray-100 px-1 rounded">{`{your-domain}/api/webhooks/whatsapp`}</code>
                </p>
              </div>
              <Button variant="whatsapp">Save WhatsApp Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>Configure AI provider and conversation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">AI Provider</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="grok">xAI (Grok)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Default Language</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="HINGLISH">Hinglish (Hindi + English)</option>
                  <option value="HINDI">Hindi (Devanagari)</option>
                  <option value="ENGLISH">English</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">AI Tone</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="friendly">Friendly & Caring</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                </select>
              </div>
              <Button variant="whatsapp">Save AI Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinic">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>This info will be used by the AI in conversations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Clinic Name</label>
                <Input placeholder="Dr. Sharma's Dental Clinic" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input placeholder="123, MG Road, Delhi" />
              </div>
              <div>
                <label className="text-sm font-medium">Working Hours</label>
                <Input placeholder="Mon-Sat: 9 AM - 7 PM" />
              </div>
              <div>
                <label className="text-sm font-medium">Services Offered</label>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                  placeholder="Root Canal, Teeth Whitening, Braces, Dental Implants..."
                />
              </div>
              <Button variant="whatsapp">Save Clinic Info</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>WhatsApp approved message templates (HSM)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "welcome_message", status: "APPROVED", lang: "hi" },
                  { name: "appointment_reminder", status: "APPROVED", lang: "hi" },
                  { name: "post_treatment_day1", status: "APPROVED", lang: "hi" },
                  { name: "feedback_request", status: "APPROVED", lang: "hi" },
                ].map((tpl) => (
                  <div key={tpl.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{tpl.name}</p>
                      <p className="text-xs text-gray-500">Language: {tpl.lang}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{tpl.status}</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Templates must be approved by Meta before they can be used for outbound messages
                outside the 24-hour session window.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
