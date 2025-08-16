"use client";

import { useState } from "react";
import { Effect, pipe } from "effect";
import { Icons } from "@/components/icons";
import { FormMessage } from "@/components/form-message";
import { authClient } from "@/lib/client/auth";
import { clientRuntime } from "@/lib/client-runtime";
import { SignInWithGoogleError } from "@/lib/client/errors";

export function GoogleSignInButton() {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignInWithGoogle() {
    setIsPending(true);
    setErrorMessage(null);

    const program = Effect.tryPromise({
      try: () => authClient.signIn.social({ provider: "google" }),
      catch: () =>
        new SignInWithGoogleError({
          message: "Could not start sign-in. Please try again.",
        }),
    });

    const handledProgram = pipe(
      program,
      Effect.catchTag("SignInWithGoogleError", (error) =>
        Effect.sync(() => {
          setErrorMessage(error.message);
        })
      ),
      Effect.ensureErrorType<never>(),
      Effect.ensuring(Effect.sync(() => setIsPending(false)))
    );

    await clientRuntime.runPromise(handledProgram);
  }

  return (
    <div>
      <FormMessage message={errorMessage} type="error" />

      <button
        type="button"
        onClick={handleSignInWithGoogle}
        disabled={isPending}
        className="item-center flex w-full justify-center rounded-md border border-neutral-300 py-2 text-sm font-medium text-neutral-900 shadow-xs transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Icons.loader className="mr-2 inline-block size-5 animate-spin" />
        ) : (
          <Icons.google className="mr-2 inline-block size-5" />
        )}
        Sign in with Google
      </button>
    </div>
  );
}
