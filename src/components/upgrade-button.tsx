"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2, Zap } from "lucide-react";

interface UpgradeButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function UpgradeButton({
  variant = "default",
  size = "default",
  className = "",
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { url, error } = await response.json();

      if (error) {
        console.error("Error creating checkout session:", error);
        alert("Something went wrong. Please try again.");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleUpgrade}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Upgrade to Premium
        </>
      )}
    </Button>
  );
}
