"use client";

import SellerOverview from "@/components/SellerOverview";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import UserOverview from "@/components/UserOverview";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login?callbackUrl=/dashboard");
    },
  });

  const user = useCurrentUser();
  console.log(user?.user?.role)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {
        user.user?.role === "user" && <UserOverview />
      }

      {
        user.user?.role === "seller" && <SellerOverview />
      }
      {/* <SellerOverview /> */}
    </div>
  );
}