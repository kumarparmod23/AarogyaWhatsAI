import Link from "next/link";
import { Heart, MessageSquare, Users, BarChart3, Bot, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-whatsapp rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">AarogyaWhatsAI</span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 bg-whatsapp text-white rounded-lg hover:bg-whatsapp-dark transition-colors text-sm font-medium"
        >
          Login / Sign Up
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          WhatsApp Automation for
          <span className="text-whatsapp"> Healthcare</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          AI-powered patient engagement on WhatsApp. Automate lead capture,
          appointment booking, follow-ups, and feedback — all in Hindi/Hinglish.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-whatsapp text-white rounded-lg hover:bg-whatsapp-dark transition-colors font-medium"
          >
            Get Started Free
          </Link>
          <Link
            href="#features"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            See Features
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Bot,
              title: "AI Conversations",
              desc: "Natural Hindi/Hinglish conversations with patients. AI handles lead qualification, appointment booking, and follow-ups automatically.",
            },
            {
              icon: MessageSquare,
              title: "WhatsApp Integration",
              desc: "Official Meta Business API integration. Template messages, media support, and 24-hour session management built in.",
            },
            {
              icon: Users,
              title: "Patient Management",
              desc: "Automatic lead capture, scoring, and tagging. Complete patient database with conversation history and AI summaries.",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              desc: "Track response rates, booking rates, NPS scores, and no-show reduction. Data-driven clinic management.",
            },
            {
              icon: Heart,
              title: "Post-Treatment Care",
              desc: "Automated follow-ups on Day 1, 3, 7, and 30. Monitor patient recovery and collect feedback.",
            },
            {
              icon: Shield,
              title: "Privacy & Consent",
              desc: "Built-in consent management. Patient data encryption and compliance-ready architecture.",
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-whatsapp/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-whatsapp-dark" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>AarogyaWhatsAI - Made with care for Indian healthcare</p>
      </footer>
    </div>
  );
}
