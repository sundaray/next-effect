"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Effect, pipe } from "effect";
import { Icons } from "@/components/icons";
import { FormMessage } from "@/components/form-message";
import { authClient } from "@/lib/client/auth";
import { clientRuntime } from "@/lib/client-runtime";
import { ConfigError, SignInWithGoogleError } from "@/lib/client/errors";

export function SignInWitjGoogleForm() {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  async function handleSignInWithGoogle() {
    setIsPending(true);
    setErrorMessage(null);

    const program = Effect.gen(function* () {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

      if (!baseUrl) {
        return yield* Effect.fail(
          new ConfigError({
            message: "NEXT_PUBLIC_BASE_URL environment variable is not found.",
          })
        );
      }

      const callbackURL = next ? `${baseUrl}${next}` : baseUrl;

      yield* Effect.tryPromise({
        try: () =>
          authClient.signIn.social({
            provider: "google",
            callbackURL,
          }),
        catch: () =>
          new SignInWithGoogleError({
            message: "Google sign-in failed. Please try again.",
          }),
      });
    }).pipe(
      Effect.tapErrorTag("SignInWithGoogleError", (error) =>
        Effect.logError("SignInWithGoogleError: ", error)
      )
    );
    const handledProgram = pipe(
      program,
      Effect.catchTag("SignInWithGoogleError", (error) =>
        Effect.sync(() => {
          setErrorMessage(error.message);
        })
      ),
      Effect.catchTag("ConfigError", (error) =>
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
        <Icons.google className="mr-2 inline-block size-5" />
        Sign in with Google
      </button>
    </div>
  );
}
