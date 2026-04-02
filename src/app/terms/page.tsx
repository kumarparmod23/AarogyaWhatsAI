"use client";

import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-whatsapp rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold">AarogyaWhatsAI</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-whatsapp hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: April 2, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using AarogyaWhatsAI (&quot;the App&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">2. Description of Service</h2>
            <p>AarogyaWhatsAI is a WhatsApp automation platform for healthcare clinics that provides:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Patient management and lead tracking</li>
              <li>WhatsApp Business API integration for patient messaging</li>
              <li>AI-powered conversation assistance in Hindi/Hinglish</li>
              <li>Appointment booking and reminder management</li>
              <li>Bulk broadcast messaging</li>
              <li>Analytics and reporting</li>
              <li>Data export capabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">3. User Responsibilities</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 API Keys &amp; Accounts</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for obtaining and maintaining your own API keys (WhatsApp Business API, AI providers).</li>
              <li>You must comply with the terms of service of all third-party APIs you use through the App.</li>
              <li>You are responsible for any costs or charges incurred through third-party API usage.</li>
              <li>You must keep your API keys secure and not share them with unauthorized parties.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.2 WhatsApp Business API Compliance</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must comply with <a href="https://www.whatsapp.com/legal/business-policy" className="text-whatsapp hover:underline" target="_blank" rel="noopener">WhatsApp Business Policy</a> and <a href="https://www.whatsapp.com/legal/commerce-policy" className="text-whatsapp hover:underline" target="_blank" rel="noopener">Commerce Policy</a>.</li>
              <li>You must obtain proper opt-in consent from patients before messaging them.</li>
              <li>You must not send spam, unsolicited messages, or violate WhatsApp&apos;s messaging limits.</li>
              <li>You must use approved message templates for business-initiated conversations.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.3 Healthcare Compliance</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must comply with all applicable healthcare laws and regulations in India.</li>
              <li>You must comply with the Digital Personal Data Protection Act (DPDPA), 2023.</li>
              <li>You must not use AI-generated responses as medical advice, diagnosis, or treatment recommendations.</li>
              <li>You are solely responsible for the accuracy and appropriateness of messages sent to patients.</li>
              <li>You must maintain proper patient consent records as required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Ownership</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You retain full ownership of all data you create and manage through the App.</li>
              <li>All data is stored locally on your device. We do not have access to your data.</li>
              <li>You are responsible for backing up your data using the Export feature.</li>
              <li>We are not liable for data loss due to browser data clearing, device failure, or any other cause.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">5. Prohibited Uses</h2>
            <p>You agree not to use the App to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Send spam or unsolicited messages to individuals who have not opted in.</li>
              <li>Provide medical diagnoses or treatment recommendations through AI features.</li>
              <li>Store or process data in violation of applicable privacy laws.</li>
              <li>Engage in any activity that violates WhatsApp&apos;s terms of service.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation.</li>
              <li>Transmit harmful, offensive, or illegal content through the platform.</li>
              <li>Attempt to reverse-engineer, decompile, or disassemble the App.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">6. Disclaimer of Warranties</h2>
            <p>THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>We do not guarantee uninterrupted or error-free service.</li>
              <li>We do not guarantee the accuracy of AI-generated responses.</li>
              <li>We do not guarantee delivery of WhatsApp messages (this depends on Meta&apos;s services).</li>
              <li>We are not a healthcare provider and do not provide medical advice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">7. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL AAROGYAWHATSAI, ITS DEVELOPERS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR USE OF THE APP.</p>
            <p className="mt-2">This includes but is not limited to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Loss of patient data stored locally.</li>
              <li>Errors or inaccuracies in AI-generated content.</li>
              <li>Failure of WhatsApp message delivery.</li>
              <li>Third-party API service interruptions or charges.</li>
              <li>Any consequences arising from messages sent through the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">8. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless AarogyaWhatsAI and its developers from any claims, damages, losses, liabilities, and expenses arising from your use of the App, violation of these Terms, or violation of any third-party rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">9. Open Source License</h2>
            <p>AarogyaWhatsAI is an open-source project. The source code is available on <a href="https://github.com/kumarparmod23/AarogyaWhatsAI" className="text-whatsapp hover:underline" target="_blank" rel="noopener">GitHub</a>. Use of the source code is subject to the applicable open-source license.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">10. Modifications to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Your continued use of the App after changes constitutes acceptance of the modified Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">11. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in India.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">12. Contact Information</h2>
            <p>For questions about these Terms of Service, please contact us at:</p>
            <p className="mt-2"><strong>Email:</strong> support@aarogyawhatsai.com</p>
            <p><strong>GitHub:</strong> <a href="https://github.com/kumarparmod23/AarogyaWhatsAI" className="text-whatsapp hover:underline" target="_blank" rel="noopener">github.com/kumarparmod23/AarogyaWhatsAI</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500 mt-12">
        <div className="flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-whatsapp">Privacy Policy</Link>
          <span>&bull;</span>
          <Link href="/terms" className="hover:text-whatsapp font-medium">Terms of Service</Link>
        </div>
        <p className="mt-2">AarogyaWhatsAI &mdash; Made with care for Indian healthcare</p>
      </footer>
    </div>
  );
}
