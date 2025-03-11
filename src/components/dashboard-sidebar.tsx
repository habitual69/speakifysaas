"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileAudio,
  Home,
  Settings,
  User,
  Volume2,
  Zap,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    title: "Conversions",
    href: "/dashboard/conversions",
    icon: <FileAudio className="w-5 h-5" />,
  },
  {
    title: "New Conversion",
    href: "/#converter",
    icon: <Volume2 className="w-5 h-5" />,
    external: true,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    title: "Usage",
    href: "/dashboard/usage",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 pt-6">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffba08] to-[#d00000] flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <div className="font-semibold text-lg">Speakify</div>
        </div>
      </div>

      <div className="space-y-1 px-3">
        {sidebarItems.map((item) => {
          const isActive = !item.external && pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-[#ffba08]/10 text-[#ffba08] font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-3 pb-6">
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#ffba08]" />
            <h4 className="font-medium text-sm">Upgrade to Premium</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock unlimited conversions and premium voices
          </p>
          <Link
            href="/#pricing"
            className="block text-center text-xs bg-[#ffba08] text-[#1c3144] px-3 py-1.5 rounded-md font-medium hover:bg-[#ffba08]/90 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    </aside>
  );
}
