// hooks/useCurrentUser.ts
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  // add other fields if needed
}

export function useCurrentUser() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`);
        if (!res.ok) throw new Error("Failed to fetch user data");

        const data: UserData = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchUser();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

  return { user, loading, error };
}
