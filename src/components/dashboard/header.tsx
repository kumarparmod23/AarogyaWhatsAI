"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { MobileSidebar } from "./mobile-sidebar";
import { store } from "@/lib/store";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setName(store.getClinic().doctorName || "Doctor");
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">
            Welcome, {name}
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          {store.getClinic().clinicName || "AarogyaWhatsAI"}
        </div>
      </header>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
