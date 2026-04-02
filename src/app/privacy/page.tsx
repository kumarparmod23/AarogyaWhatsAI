"use client";

import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: April 2, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">1. Introduction</h2>
            <p>AarogyaWhatsAI (&quot;we,&quot; &quot;our,&quot; or &quot;the App&quot;) is a WhatsApp automation platform designed for healthcare clinics and doctors in India. We are committed to protecting the privacy and security of your personal information and your patients&apos; data.</p>
            <p>This Privacy Policy explains how we collect, use, store, and protect information when you use our application.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">2. Data Storage &mdash; Local-First Architecture</h2>
            <p>AarogyaWhatsAI follows a <strong>local-first data architecture</strong>. This means:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>All patient data, messages, appointments, and campaign records are stored locally</strong> on your device&apos;s browser storage (localStorage).</li>
              <li>We do <strong>not</strong> maintain any central database or cloud storage for your clinic&apos;s data.</li>
              <li>Your data remains entirely on your device and is <strong>never uploaded to our servers</strong>.</li>
              <li>If you clear your browser data or uninstall the app, your local data will be permanently deleted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">3. Information We Process</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">3.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Clinic Information:</strong> Clinic name, doctor name, phone number, address, specialization.</li>
              <li><strong>API Keys:</strong> WhatsApp Business API tokens, AI provider API keys. These are stored locally on your device only.</li>
              <li><strong>Patient Data:</strong> Patient names, phone numbers, age, gender, city, medical notes, appointment history &mdash; all stored locally.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.2 Third-Party API Communications</h3>
            <p>When you use features that require external services, data is transmitted to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Meta WhatsApp Business API:</strong> Patient phone numbers and message content are sent to Meta&apos;s servers to deliver WhatsApp messages. This is governed by <a href="https://www.whatsapp.com/legal/privacy-policy" className="text-whatsapp hover:underline" target="_blank" rel="noopener">WhatsApp&apos;s Privacy Policy</a>.</li>
              <li><strong>AI Providers (OpenAI/Anthropic/xAI):</strong> Conversation context may be sent to generate AI responses. This is governed by the respective provider&apos;s privacy policy.</li>
            </ul>
            <p className="mt-2">These API calls are made directly from the application using <strong>your own API keys</strong>. We do not proxy, store, or log any of this data on our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">4. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To enable WhatsApp messaging between your clinic and patients.</li>
              <li>To generate AI-powered responses for patient conversations.</li>
              <li>To manage patient records, appointments, and follow-ups locally.</li>
              <li>To send bulk broadcast messages to your patient list.</li>
              <li>To compute analytics and reports from your local data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">5. Data Security</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>All data is stored locally on your device and is not transmitted to any central server.</li>
              <li>API keys are stored in your browser&apos;s localStorage and are only sent to their respective services (Meta, OpenAI, etc.) when needed.</li>
              <li>We recommend using HTTPS (enabled by default on Vercel) for all communications.</li>
              <li>You are responsible for securing access to your device and browser.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">6. Patient Consent &amp; Healthcare Compliance</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for obtaining patient consent before sending WhatsApp messages.</li>
              <li>The app includes consent tracking features to help you manage patient opt-ins.</li>
              <li>You must comply with applicable healthcare regulations including the Digital Personal Data Protection Act (DPDPA), 2023.</li>
              <li>Do not use the AI features to provide medical diagnoses or treatment recommendations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">7. Data Retention &amp; Deletion</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Data is retained locally as long as it remains in your browser storage.</li>
              <li>You can delete all data at any time via <strong>Settings &rarr; Clear All Data</strong>.</li>
              <li>You can export your data as CSV files before deletion via the <strong>Export</strong> feature.</li>
              <li>Clearing browser data/cache will permanently remove all stored information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">8. Children&apos;s Privacy</h2>
            <p>AarogyaWhatsAI is designed for use by healthcare professionals. It is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated date. Continued use of the application after changes constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, please contact us at:</p>
            <p className="mt-2"><strong>Email:</strong> support@aarogyawhatsai.com</p>
            <p><strong>GitHub:</strong> <a href="https://github.com/kumarparmod23/AarogyaWhatsAI" className="text-whatsapp hover:underline" target="_blank" rel="noopener">github.com/kumarparmod23/AarogyaWhatsAI</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500 mt-12">
        <div className="flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-whatsapp font-medium">Privacy Policy</Link>
          <span>&bull;</span>
          <Link href="/terms" className="hover:text-whatsapp">Terms of Service</Link>
        </div>
        <p className="mt-2">AarogyaWhatsAI &mdash; Made with care for Indian healthcare</p>
      </footer>
    </div>
  );
}
