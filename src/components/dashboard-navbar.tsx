"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { UserCircle, Home, Bell } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { useRouter } from "next/navigation";
import MobileSidebar from "./mobile-sidebar";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur-sm py-3">
      <div className="px-4 flex justify-between items-center max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <Link href="/" prefetch className="flex items-center">
            <img
              src="https://s3.tebi.io/webimages/SPEAKIFY.svg"
              alt="Speakify Logo"
              className="h-8"
            />
          </Link>
        </div>
        <div className="flex gap-3 items-center">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#d00000] rounded-full"></span>
          </Button>
          <ThemeSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.refresh();
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
