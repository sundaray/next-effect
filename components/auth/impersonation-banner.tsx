"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import type { SessionPayload } from "@/lib/services/auth-service";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

interface ImpersonationBannerProps {
  sessionPayload: SessionPayload;
}

export function ImpersonationBanner({
  sessionPayload,
}: ImpersonationBannerProps) {
  const [isStopping, setIsStopping] = useState(false);
  const router = useRouter();

  const session = sessionPayload?.session;
  const user = sessionPayload?.user;

  if (!session?.impersonatedBy) {
    return null;
  }

  const handleStopImpersonating = async () => {
    setIsStopping(true);
    try {
      await authClient.admin.stopImpersonating({});
      router.refresh();
    } catch (error) {
      console.error("Failed to stop impersonating:", error);
    } finally {
      setIsStopping(false);
    }
  };
  return (
    <div className="inset-x-0 flex flex-col items-center justify-around gap-4 bg-amber-500 p-4 text-center text-sm font-medium text-white sm:flex-row sm:gap-10">
      <span>
        👤 Impersonating <span className="font-bold">{user?.email}</span>.
      </span>
      <Button onClick={handleStopImpersonating}>
        {isStopping && <Icons.spinner className="size-4 animate-spin" />}
        {isStopping ? "Stopping..." : "Stop Impersonating"}
      </Button>
    </div>
  );
}
