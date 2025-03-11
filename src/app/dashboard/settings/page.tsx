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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Globe,
  Key,
  Moon,
  Shield,
  Sun,
  Trash,
  Volume2,
  Star,
  Zap,
  BarChart3,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export default async function SettingsPage() {
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

  // Mock available voices
  const availableVoices = [
    { id: "en-US-1", name: "Emma (US Female)", isPremium: false },
    { id: "en-US-2", name: "Michael (US Male)", isPremium: false },
    { id: "en-GB-1", name: "Olivia (UK Female)", isPremium: false },
    { id: "en-GB-2", name: "James (UK Male)", isPremium: false },
    { id: "en-AU-1", name: "Charlotte (AU Female)", isPremium: false },
    { id: "en-US-3", name: "Sophia (US Female)", isPremium: true },
    { id: "en-US-4", name: "William (US Male)", isPremium: true },
    { id: "en-GB-3", name: "Emily (UK Female)", isPremium: true },
    { id: "en-GB-4", name: "Thomas (UK Male)", isPremium: true },
  ];

  const isPremium = userData?.subscription_tier === "premium";
  const tokenLimit = userData?.monthly_token_limit || 10000;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <header>
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and preferences
          </p>
        </header>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-[#ffba08]" />
              <Moon className="h-5 w-5 text-[#ffba08]" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how Speakify looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Dark Mode</h4>
                  <p className="text-xs text-muted-foreground">
                    Toggle between light and dark mode
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <select
                  id="font-size"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="small">Small</option>
                  <option value="medium" selected>
                    Medium
                  </option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90">
              Save Appearance
            </Button>
          </CardFooter>
        </Card>

        {/* Voice Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-[#ffba08]" />
              Voice Settings
            </CardTitle>
            <CardDescription>
              Manage your favorite voices and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-voice">Default Voice</Label>
                <select
                  id="default-voice"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {availableVoices
                    .filter((voice) => !voice.isPremium || isPremium)
                    .map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} {voice.isPremium ? "(Premium)" : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Favorite Voices</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {availableVoices
                    .filter((voice) => !voice.isPremium || isPremium)
                    .map((voice) => (
                      <div
                        key={voice.id}
                        className="flex items-center justify-between p-3 border rounded-md bg-background"
                      >
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <span>{voice.name}</span>
                          {voice.isPremium && (
                            <span className="text-xs bg-[#ffba08]/10 text-[#ffba08] px-2 py-0.5 rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-[#ffba08]"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90">
              Save Voice Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Token Limit Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#ffba08]" />
              Token Usage Settings
            </CardTitle>
            <CardDescription>
              {isPremium
                ? "You have unlimited tokens with your premium subscription"
                : "Manage your monthly token limit and usage alerts"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isPremium ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-[#ffba08]" />
                      <h3 className="font-medium">Current Monthly Limit</h3>
                    </div>
                    <div className="text-lg font-bold">
                      {tokenLimit.toLocaleString()} tokens
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Your limit resets on the 1st of each month. Upgrade to
                    premium for unlimited tokens.
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage-alert">Usage Alert Threshold</Label>
                  <select
                    id="usage-alert"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="50">50% of limit</option>
                    <option value="75">75% of limit</option>
                    <option value="90" selected>
                      90% of limit
                    </option>
                    <option value="100">100% of limit</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium">
                      Email Notifications for Usage
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Receive email when you reach your alert threshold
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-6 bg-[#ffba08]/10 rounded-lg border border-[#ffba08]/20">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-[#ffba08]" />
                  <div>
                    <h3 className="font-medium">Premium Subscription Active</h3>
                    <p className="text-sm text-muted-foreground">
                      You have unlimited tokens with your premium subscription
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {!isPremium && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="gap-2">
                <Zap className="h-4 w-4 text-[#ffba08]" />
                Upgrade to Premium
              </Button>
              <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90">
                Save Token Settings
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-[#ffba08]" />
              Audio Settings
            </CardTitle>
            <CardDescription>
              Configure audio playback preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audio-quality">Audio Quality</Label>
                <select
                  id="audio-quality"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="standard">Standard (128kbps)</option>
                  <option value="high" selected>
                    High (256kbps)
                  </option>
                  <option value="ultra">Ultra (320kbps)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio-format">Audio Format</Label>
                <select
                  id="audio-format"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="mp3" selected>
                    MP3
                  </option>
                  <option value="wav">WAV</option>
                  <option value="ogg">OGG</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Auto-play Audio</h4>
                  <p className="text-xs text-muted-foreground">
                    Automatically play audio after conversion
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90">
              Save Audio Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#ffba08]" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Manage your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    Receive email notifications
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Conversion Completed</h4>
                  <p className="text-xs text-muted-foreground">
                    Get notified when a conversion is completed
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Token Usage Alerts</h4>
                  <p className="text-xs text-muted-foreground">
                    Get notified when you reach your token usage threshold
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Marketing Updates</h4>
                  <p className="text-xs text-muted-foreground">
                    Receive updates about new features and promotions
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90">
              Save Notification Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ffba08]" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your privacy and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">
                    Save Conversion History
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Store your conversion history for future reference
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Data Analytics</h4>
                  <p className="text-xs text-muted-foreground">
                    Allow us to collect anonymous usage data to improve our
                    service
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash className="h-4 w-4" />
                  Delete All Conversion History
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90">
              Save Privacy Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
