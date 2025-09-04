"use client";

import { FormMessage } from "@/components/forms/form-message";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/client";
import { clientRuntime } from "@/lib/client-runtime";
import { ConfigError, SignInWithGoogleError } from "@/lib/client/errors";
import { Effect, pipe } from "effect";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

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
          }),
        );
      }

      const callbackURL = next ? `${baseUrl}${next}` : baseUrl;

      yield* Effect.tryPromise({
        try: () =>
          signIn.social({
            provider: "google",
            callbackURL,
          }),
        catch: () =>
          new SignInWithGoogleError({
            message: "Google sign-in failed. Please try again.",
          }),
      });
    });

    const handledProgram = pipe(
      program,
      Effect.tapErrorTag("ConfigError", (error) =>
        Effect.logError("ConfigError: ", error),
      ),
      Effect.tapErrorTag("SignInWithGoogleError", (error) =>
        Effect.logError("SignInWithGoogleError: ", error),
      ),
      Effect.catchTag("SignInWithGoogleError", (error) =>
        Effect.sync(() => {
          setErrorMessage(error.message);
        }),
      ),
      Effect.catchTag("ConfigError", (error) =>
        Effect.sync(() => {
          setErrorMessage(error.message);
        }),
      ),
      Effect.ensureErrorType<never>(),
      Effect.ensuring(Effect.sync(() => setIsPending(false))),
    );

    await clientRuntime.runPromise(handledProgram);
  }

  return (
    <div>
      {errorMessage && <FormMessage message={errorMessage} type="error" />}
      <Button
        variant="ghost"
        onClick={handleSignInWithGoogle}
        disabled={isPending}
        className="h-10 w-full border border-neutral-300 hover:bg-white"
      >
        <Icons.google className="inline-block size-5" />
        Sign in with Google
      </Button>
    </div>
  );
}
