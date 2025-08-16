"use client";

import { Effect, Data, pipe } from "effect";
import { useState, useId } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { FormMessage } from "@/components/form-message";
import { FormFieldMessage } from "@/components/form-field-message";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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

class VerifyOtpError extends Data.TaggedError("VerifyOtpError")<{
  message: string;
}> {}

type FormStep = "email" | "otp";

export function SignInWithEmailOtpForm({ next }: { next: string }) {
  const [step, setStep] = useState<FormStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const id = useId();
  const fieldErrorId = `email-error-${id}`;
  const otpErrorId = `otp-error-${id}`;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInWithEmailOtpFormSchemaType>({
    resolver: effectTsResolver(SignInWithEmailOtpFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  async function handleSendOtp(data: SignInWithEmailOtpFormSchemaType) {
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
            setSuccessMessage(`An OTP has been sent to ${data.email}.`);
            setEmail(data.email);
            setStep("otp");
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

  async function handleVerifyOtp() {
    if (otp.length !== 6) return;

    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const program = Effect.tryPromise({
      try: () =>
        authClient.signIn.emailOtp({
          email,
          otp,
        }),
      catch: () =>
        new VerifyOtpError({
          message: "Invalid OTP. Please try again.",
        }),
    }).pipe(
      Effect.tapErrorTag("VerifyOtpError", (error) =>
        Effect.logError("VerifyOtpError: ", error)
      )
    );

    const handledProgram = pipe(
      program,
      Effect.tap((result) =>
        Effect.sync(() => {
          if (result.error) {
            setErrorMessage("Invalid OTP. Please try again.");
          } else {
            setSuccessMessage("Successfully signed in!");
            // Redirect after successful login
            router.push(next);
          }
        })
      ),
      Effect.catchTag("VerifyOtpError", (error) =>
        Effect.sync(() => {
          setErrorMessage(error.message);
        })
      ),
      Effect.ensureErrorType<never>(),
      Effect.ensuring(Effect.sync(() => setIsProcessing(false)))
    );

    await clientRuntime.runPromise(handledProgram);
  }

  function handleBackToEmail() {
    setStep("email");
    setOtp("");
    setSuccessMessage(null);
    setErrorMessage(null);
  }

  const message = successMessage || errorMessage;
  const messageType = successMessage ? "success" : "error";

  if (step === "otp") {
    return (
      <div className="grid gap-3">
        {message && <FormMessage message={message} type={messageType} />}

        <div>
          <Label htmlFor="otp">OTP</Label>
          <div className="mt-2 grid">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isProcessing}
              onComplete={handleVerifyOtp}
              containerClassName="w-full"
            >
              <InputOTPGroup className="w-full">
                <InputOTPSlot index={0} className="w-full" />
                <InputOTPSlot index={1} className="w-full" />
                <InputOTPSlot index={2} className="w-full" />
                <InputOTPSlot index={3} className="w-full" />
                <InputOTPSlot index={4} className="w-full" />
                <InputOTPSlot index={5} className="w-full" />
              </InputOTPGroup>
            </InputOTP>
            <div className="text-left">
              <p className="text-sm text-neutral-500 mt-1">
                Enter the 6-digit OTP sent to <strong>{email}</strong>
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleVerifyOtp}
          disabled={isProcessing || otp.length !== 6}
          className="h-10"
        >
          {isProcessing ? (
            <>
              <Icons.loader className="size-3 animate-spin" />
              Verifying...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleBackToEmail}
          disabled={isProcessing}
          className="h-10"
        >
          Back to Email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleSendOtp)} className="grid gap-3">
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
