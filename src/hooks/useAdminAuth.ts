"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function useAdminAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.isLoggedIn ?? false);
        setUsername(data.username ?? null);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUsername(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setUsername(null);
    router.push("/admin/login");
  }, [router]);

  return { isLoggedIn, username, isLoading, logout };
}
