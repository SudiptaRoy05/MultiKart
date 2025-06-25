"use client";

import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import SellerAside from "./SellerAside";
import UserAside from "./UserAside";
import { Loader2 } from "lucide-react";

export default function DashboardAside() {
  const { user, loading, error } = useCurrentUser();

  const containerClasses = "h-full flex flex-col bg-card";

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center justify-center flex-1 p-4">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center justify-center flex-1 p-4">
          <div className="text-center">
            <p className="text-sm text-destructive">Failed to load</p>
            <p className="text-xs text-muted-foreground">Please refresh</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {user.role === "seller" && <SellerAside />}
      {user.role === "user" && <UserAside />}
    </div>
  );
}
