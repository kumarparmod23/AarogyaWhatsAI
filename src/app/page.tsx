"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (store.isSetupDone()) {
      router.replace("/dashboard");
    } else {
      router.replace("/setup");
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50">
        <div className="animate-pulse text-xl text-green-700 font-semibold">
          AarogyaWhatsAI Loading...
        </div>
      </div>
    );
  }

  return null;
}
