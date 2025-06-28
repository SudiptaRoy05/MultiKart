"use client";

import SellerOverview from "@/components/SellerOverview";
import UserOverview from "@/components/UserOverview";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

export default function Dashboard() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login?callbackUrl=/dashboard");
    },
  });

  const { user, loading, error } = useCurrentUser();

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-destructive">Failed to load user data</p>
          <p className="text-xs text-muted-foreground">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user.role === "user" && <UserOverview />}
      {user.role === "seller" && <SellerOverview />}
    </div>
  );
}