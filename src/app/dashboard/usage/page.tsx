import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  FileAudio,
  Mic,
  Zap,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function UsagePage() {
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

  // Fetch conversions
  const { data: conversions, error: conversionsError } = await supabase
    .from("conversions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Calculate token usage percentage
  const tokenLimit = userData?.monthly_token_limit || 10000;
  const tokensUsed = userData?.tokens_used || 0;
  const usagePercentage = Math.min(
    100,
    Math.round((tokensUsed / tokenLimit) * 100),
  );
  const isPremium = userData?.subscription_tier === "premium";

  // Mock data for charts
  const mockMonthlyUsage = [
    { month: "Jan", tokens: 2500 },
    { month: "Feb", tokens: 3200 },
    { month: "Mar", tokens: 4100 },
    { month: "Apr", tokens: 3800 },
    { month: "May", tokens: 5200 },
    { month: "Jun", tokens: 4700 },
    { month: "Jul", tokens: tokensUsed },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-6xl">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Usage Analytics</h1>
            <p className="text-muted-foreground">
              Monitor your text-to-speech usage and subscription details
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              This Month
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </header>

        {/* Usage Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-[#1c3144] to-[#0c1824] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#ffba08]" />
                Token Usage
              </CardTitle>
              <CardDescription className="text-white/70">
                {isPremium
                  ? "Unlimited access"
                  : `${tokensUsed.toLocaleString()} / ${tokenLimit.toLocaleString()} tokens`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isPremium && (
                <div className="space-y-2">
                  <Progress
                    value={usagePercentage}
                    className="h-2 bg-white/20"
                    indicatorClassName="bg-[#ffba08]"
                  />
                  <div className="flex justify-between text-xs text-white/70">
                    <span>{usagePercentage}% used</span>
                    <span>
                      {(tokenLimit - tokensUsed).toLocaleString()} tokens
                      remaining
                    </span>
                  </div>
                </div>
              )}
              {isPremium && (
                <div className="flex items-center justify-center h-8 bg-white/10 rounded-md mt-2">
                  <Zap className="h-4 w-4 text-[#ffba08] mr-2" />
                  <span className="text-sm font-medium">Unlimited</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-[#d00000]" />
                Total Conversions
              </CardTitle>
              <CardDescription>Lifetime usage statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {conversions?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {isPremium ? "Premium" : "Free"} Plan
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mic className="h-4 w-4 text-[#ffba08]" />
                Voice Usage
              </CardTitle>
              <CardDescription>Most used voice types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emma (US Female)</span>
                  <span className="text-xs text-muted-foreground">42%</span>
                </div>
                <Progress value={42} className="h-1.5" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Michael (US Male)</span>
                  <span className="text-xs text-muted-foreground">28%</span>
                </div>
                <Progress value={28} className="h-1.5" />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Olivia (UK Female)</span>
                  <span className="text-xs text-muted-foreground">18%</span>
                </div>
                <Progress value={18} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Charts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#ffba08]" />
              Usage Trends
            </CardTitle>
            <CardDescription>
              View your usage patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monthly" className="w-full">
              <TabsList className="grid w-[400px] grid-cols-3 mb-6">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>

              <TabsContent value="monthly" className="pt-4">
                <div className="h-[300px] w-full">
                  {/* This would be a real chart in production */}
                  <div className="flex h-full items-end gap-2 pb-6 pt-10 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
                      <div>6,000</div>
                      <div>4,500</div>
                      <div>3,000</div>
                      <div>1,500</div>
                      <div>0</div>
                    </div>

                    {/* Chart bars */}
                    <div className="flex-1 flex items-end justify-around gap-2 pl-12">
                      {mockMonthlyUsage.map((item, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-2 w-full"
                        >
                          <div
                            className={`w-full max-w-[40px] rounded-t-md ${i === mockMonthlyUsage.length - 1 ? "bg-[#ffba08]" : "bg-muted"}`}
                            style={{ height: `${(item.tokens / 6000) * 100}%` }}
                          ></div>
                          <div className="text-xs text-muted-foreground">
                            {item.month}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="pt-4">
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Weekly data visualization would appear here
                </div>
              </TabsContent>

              <TabsContent value="yearly" className="pt-4">
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Yearly data visualization would appear here
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Subscription Details */}
        {!isPremium && (
          <Card className="border-[#ffba08] border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#ffba08]" />
                Upgrade to Premium
              </CardTitle>
              <CardDescription>
                Unlock unlimited tokens and premium voices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#ffba08]" />
                    <h3 className="font-medium">Unlimited Tokens</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Convert as much text as you need without limits
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-[#ffba08]" />
                    <h3 className="font-medium">Premium Voices</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Access to high-quality premium voice options
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4 text-[#ffba08]" />
                    <h3 className="font-medium">Conversion History</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Unlimited storage of your conversion history
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90 px-8">
                  Upgrade Now - $5/month
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
