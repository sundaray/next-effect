import { adminClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [adminClient(), emailOTPClient()],
});

export const { signIn, signOut, useSession } = authClient;
