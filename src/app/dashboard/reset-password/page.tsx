import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import DashboardLayout from "@/components/dashboard-layout";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LockKeyhole } from "lucide-react";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-8 max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockKeyhole className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Please enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    New password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="New password"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <SubmitButton
                formAction={resetPasswordAction}
                pendingText="Resetting password..."
                className="w-full bg-[#ffba08] text-[#1c3144] hover:bg-[#ffba08]/90"
              >
                Reset password
              </SubmitButton>

              <FormMessage message={searchParams} />
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
