"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import type { SessionPayload } from "@/lib/services/auth-service";
import { useRouter } from "next/navigation";

interface ImpersonationBannerProps {
  sessionPayload: SessionPayload;
}

export function ImpersonationBanner({
  sessionPayload,
}: ImpersonationBannerProps) {
  const router = useRouter();

  const session = sessionPayload?.session;
  const user = sessionPayload?.user;

  if (!session?.impersonatedBy) {
    return null;
  }

  const handleStopImpersonating = async () => {
    await authClient.admin.stopImpersonating({});
  };

  return (
    <div className="bg-amber-500 p-2 text-center text-sm font-medium text-white">
      <span>
        👤 You are currently impersonating{" "}
        <span className="font-bold">{user?.email}</span>.
      </span>
      <Button onClick={handleStopImpersonating}>Stop Impersonating</Button>
    </div>
  );
}
