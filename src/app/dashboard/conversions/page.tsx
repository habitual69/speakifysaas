import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import { formatDistanceToNow } from "date-fns";
import {
  Download,
  FileAudio,
  Mic,
  Search,
  Filter,
  ArrowUpDown,
  Play,
} from "lucide-react";

export default async function ConversionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's conversions
  const { data: conversions, error } = await supabase
    .from("conversions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversions:", error);
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-6xl">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Your Conversions</h1>
            <p className="text-muted-foreground">
              View and manage your text-to-speech conversions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversions..."
                className="pl-9 h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {conversions && conversions.length > 0 ? (
          <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Text
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Voice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                        Tokens
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {conversions.map((conversion) => (
                    <tr
                      key={conversion.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(conversion.created_at), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="max-w-xs truncate">
                          {conversion.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mic className="w-4 h-4 mr-2 text-[#ffba08]" />
                          {conversion.voice_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {conversion.token_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#ffba08]"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary"
                          >
                            <FileAudio className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[#d00000]"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">{conversions.length}</span> of{" "}
                <span className="font-medium">{conversions.length}</span>{" "}
                conversions
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-sm border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileAudio className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No conversions yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't converted any text to speech yet. Create your first
              conversion to get started.
            </p>
            <a
              href="/#converter"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-[#1c3144] bg-[#ffba08] hover:bg-[#ffba08]/90 transition-colors"
            >
              Create your first conversion
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
