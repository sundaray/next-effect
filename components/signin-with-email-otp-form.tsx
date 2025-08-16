"use client";

import { Effect, Data, pipe } from "effect";
import { useState, useId } from "react";
import { useForm, Controller } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { FormMessage } from "@/components/form-message";
import { FormFieldMessage } from "@/components/form-field-message";
import {
  SignInWithEmailOtpFormSchemaType,
  SignInWithEmailOtpFormSchema,
} from "@/lib/schema";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { authClient } from "@/lib/client/auth";
import { clientRuntime } from "@/lib/client-runtime";

class SendVerificationOtpError extends Data.TaggedError(
  "SendVerificationOtpError"
)<{
  message: string;
}> {}

export function SignInWithEmailOtpForm({ next }: { next: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const id = useId();
  const fieldErrorId = `email-error-${id}`;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInWithEmailOtpFormSchemaType>({
    resolver: effectTsResolver(SignInWithEmailOtpFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: SignInWithEmailOtpFormSchemaType) {
    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const program = Effect.tryPromise({
      try: () =>
        authClient.emailOtp.sendVerificationOtp({
          email: data.email,
          type: "sign-in",
        }),
      catch: () =>
        new SendVerificationOtpError({
          message: "Failed to send verification OTP. Please try again.",
        }),
    }).pipe(
      Effect.tapErrorTag("SendVerificationOtpError", (error) =>
        Effect.logError("SendVerificationOtpError: ", error)
      )
    );

    const handledProgram = pipe(
      program,
      Effect.tap((result) =>
        Effect.sync(() => {
          if (result.error) {
            setErrorMessage(
              "Failed to send verification OTP. Please try again."
            );
          } else {
            setSuccessMessage("An OTP has been sent to your email.");
          }
        })
      ),
      Effect.catchTag("SendVerificationOtpError", (error) =>
        Effect.sync(() => {
          setErrorMessage(error.message);
        })
      ),
      Effect.ensureErrorType<never>(),
      Effect.ensuring(Effect.sync(() => setIsProcessing(false)))
    );

    await clientRuntime.runPromise(handledProgram);
  }

  const message = successMessage || errorMessage;
  const messageType = successMessage ? "success" : "error";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
      {message && <FormMessage message={message} type={messageType} />}
      <div>
        <Label htmlFor="email">Email</Label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="email"
              type="email"
              className="mt-2"
              disabled={isProcessing}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? fieldErrorId : undefined}
            />
          )}
        />
        <FormFieldMessage
          errorId={fieldErrorId}
          errorMessage={errors.email?.message}
        />
      </div>

      <Button type="submit" disabled={isProcessing} className="h-10">
        {isProcessing ? (
          <>
            <Icons.loader className="size-3 animate-spin" />
            Sending OTP...
          </>
        ) : (
          "Send OTP"
        )}
      </Button>
    </form>
  );
}
