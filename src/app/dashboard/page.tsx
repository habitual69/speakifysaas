import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FileAudio,
  InfoIcon,
  Mic,
  UserCircle,
  Volume2,
  Zap,
  ArrowRight,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user data including subscription info
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch recent conversions
  const { data: recentConversions, error: conversionsError } = await supabase
    .from("conversions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Calculate token usage percentage
  const tokenLimit = userData?.monthly_token_limit || 10000;
  const tokensUsed = userData?.tokens_used || 0;
  const usagePercentage = Math.min(
    100,
    Math.round((tokensUsed / tokenLimit) * 100),
  );
  const isPremium = userData?.subscription_tier === "premium";

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-6xl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1c3144] to-[#0c1824] rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffba08] rounded-full filter blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#d00000] rounded-full filter blur-[80px]"></div>
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back,{" "}
              {userData?.name || user.email?.split("@")[0] || "User"}
            </h1>
            <p className="text-white/80 max-w-lg mb-4">
              {isPremium
                ? "You have premium access with unlimited conversions."
                : "You're on the free plan. Upgrade to premium for unlimited conversions."}
            </p>
            {!isPremium && (
              <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90">
                <Zap className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Token Usage Card */}
          <Card className="border-l-4 border-l-[#ffba08]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#ffba08]" />
                Token Usage
              </CardTitle>
              <CardDescription>
                {isPremium
                  ? "Unlimited access"
                  : `${tokensUsed.toLocaleString()} / ${tokenLimit.toLocaleString()} tokens`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isPremium && (
                <Progress
                  value={usagePercentage}
                  className="h-2"
                  indicatorClassName={
                    usagePercentage > 80 ? "bg-[#d00000]" : "bg-[#ffba08]"
                  }
                />
              )}
              {isPremium && (
                <div className="flex items-center justify-center h-8 bg-[#ffba08]/10 rounded-md">
                  <Zap className="h-4 w-4 text-[#ffba08] mr-2" />
                  <span className="text-sm font-medium">Unlimited</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card className="border-l-4 border-l-[#d00000]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#d00000]" />
                Subscription
              </CardTitle>
              <CardDescription>
                {isPremium ? "Premium Plan" : "Free Plan"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-center justify-center h-8 ${isPremium ? "bg-[#d00000]/10" : "bg-muted"} rounded-md`}
              >
                <span
                  className={`text-sm font-medium ${isPremium ? "text-[#d00000]" : ""}`}
                >
                  {isPremium ? "$5/month" : "Free"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Conversions */}
          <Card className="border-l-4 border-l-[#1c3144]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-[#1c3144]" />
                Total Conversions
              </CardTitle>
              <CardDescription>Lifetime usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-8 bg-muted rounded-md">
                <span className="text-sm font-medium">
                  {recentConversions?.length || 0} conversions
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Last Conversion */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Last Conversion
              </CardTitle>
              <CardDescription>
                {recentConversions && recentConversions.length > 0
                  ? new Date(
                      recentConversions[0].created_at,
                    ).toLocaleDateString()
                  : "No conversions yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/#converter">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                >
                  New Conversion
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversions */}
        <section className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileAudio className="h-5 w-5 text-[#ffba08]" />
              Recent Conversions
            </h2>
            <Link href="/dashboard/conversions">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {recentConversions && recentConversions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Text
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Voice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tokens
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentConversions.map((conversion) => (
                    <tr
                      key={conversion.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(conversion.created_at).toLocaleDateString()}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversions yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You haven't converted any text to speech yet. Create your first
                conversion to get started.
              </p>
              <Link href="/#converter">
                <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90">
                  <Volume2 className="mr-2 h-4 w-4" />
                  Create your first conversion
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* User Profile Section */}
        <section className="bg-card rounded-xl p-6 border shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1c3144] to-[#0c1824] flex items-center justify-center text-white">
              <UserCircle size={24} />
            </div>
            <div>
              <h2 className="font-semibold text-xl">
                {userData?.name || user.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Edit Profile
            </Button>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Account Details</h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-background rounded-md border">
                <div className="text-xs text-muted-foreground mb-1">
                  User ID
                </div>
                <div className="text-sm font-mono truncate">{user.id}</div>
              </div>
              <div className="p-3 bg-background rounded-md border">
                <div className="text-xs text-muted-foreground mb-1">
                  Created At
                </div>
                <div className="text-sm">
                  {new Date(
                    userData?.created_at || Date.now(),
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
