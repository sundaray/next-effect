"use client";

import { useSearchParams } from "next/navigation";
import { Effect, Data, pipe } from "effect";
import { useState, useId } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "motion/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { authClient } from "@/lib/auth/client";
import { clientRuntime } from "@/lib/client-runtime";
import { Spinner } from "@/components/ui/kibo-ui/spinner";

class SendVerificationOtpError extends Data.TaggedError(
  "SendVerificationOtpError"
)<{
  message: string;
}> {}

class VerifyOtpError extends Data.TaggedError("VerifyOtpError")<{
  message: string;
}> {}

type FormStep = "email" | "otp";

export function SignInWithEmailOtpForm() {
  const [step, setStep] = useState<FormStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpErrorMessage, setOtpErrorMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const next = searchParams.get("next");

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

  // -----------------------------------------------

  //  Send OTP

  // -----------------------------------------------

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
            setErrorMessage("Failed to send OTP. Please try again.");
          } else {
            setSuccessMessage("A 6-digit OTP has been sent to your email.");
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

  // -----------------------------------------------

  //  Verify OTP

  // -----------------------------------------------

  async function handleVerifyOtp() {
    if (otp.length !== 6) return;

    setIsProcessing(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setOtpErrorMessage(null);

    const program = Effect.tryPromise({
      try: () =>
        authClient.signIn.emailOtp({
          email,
          otp,
        }),
      catch: () =>
        new VerifyOtpError({
          message: "Incorrect OTP. Please try again.",
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
            if (result.error.code === "TOO_MANY_ATTEMPTS") {
              setOtpErrorMessage(
                "Too many attempts. Please go back and request a new OTP."
              );
            } else if (result.error.code === "INVALID_OTP") {
              setOtpErrorMessage("Invalid OTP. Please try again.");
            } else {
              setOtpErrorMessage("OTP verification failed. Please try again.");
            }
            setIsProcessing(false);
          } else {
            router.push(next || "/");
            router.refresh();
          }
        })
      ),
      Effect.catchTag("VerifyOtpError", (error) =>
        Effect.sync(() => {
          setOtpErrorMessage(error.message);
        })
      ),
      Effect.ensureErrorType<never>()
    );

    await clientRuntime.runPromise(handledProgram);
  }

  function handleBackToEmail() {
    setStep("email");
    setOtp("");
    setSuccessMessage(null);
    setErrorMessage(null);
    setOtpErrorMessage(null);
  }

  function handleOtpChange(value: string) {
    if (otpErrorMessage) {
      setOtpErrorMessage(null);
    }
    setOtp(value);
  }

  const message = successMessage || errorMessage;
  const messageType = successMessage ? "success" : "error";

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {step === "email" ? (
          <motion.form
            key="email-step"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{
              ease: "easeOut",
              duration: 0.2,
            }}
            onSubmit={handleSubmit(handleSendOtp)}
            className="grid"
          >
            {message && <FormMessage message={message} type={messageType} />}
            <div className={message ? "mt-4" : ""}>
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    className="mt-2 border-neutral-300"
                    placeholder="john@gmail.com"
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

            <Button type="submit" disabled={isProcessing} className="h-10 mt-2">
              {isProcessing ? (
                <>
                  <Spinner
                    className="size-4 inline-block"
                    variant="circle-filled"
                  />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="otp-step"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{
              ease: "easeOut",
              duration: 0.2,
            }}
            className="grid"
          >
            {message && <FormMessage message={message} type={messageType} />}

            <div className={message ? "mt-4" : ""}>
              <Label htmlFor="otp">OTP</Label>
              <div className="mt-2 grid">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={isProcessing}
                  onComplete={handleVerifyOtp}
                  containerClassName="w-full"
                  aria-invalid={otpErrorMessage ? "true" : "false"}
                  aria-describedby={otpErrorMessage ? otpErrorId : undefined}
                >
                  <InputOTPGroup className="w-full">
                    <InputOTPSlot
                      index={0}
                      className="w-full border-neutral-300"
                    />
                    <InputOTPSlot
                      index={1}
                      className="w-full border-neutral-300"
                    />
                    <InputOTPSlot
                      index={2}
                      className="w-full border-neutral-300"
                    />
                    <InputOTPSlot
                      index={3}
                      className="w-full border-neutral-300"
                    />
                    <InputOTPSlot
                      index={4}
                      className="w-full border-neutral-300"
                    />
                    <InputOTPSlot
                      index={5}
                      className="w-full border-neutral-300"
                    />
                  </InputOTPGroup>
                </InputOTP>
                <div className="text-left">
                  {otpErrorMessage ? (
                    <FormFieldMessage
                      errorId={otpErrorId}
                      errorMessage={otpErrorMessage}
                    />
                  ) : (
                    <p className="text-sm text-neutral-500 mt-1">
                      Enter the 6-digit OTP sent to your email.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isProcessing || otp.length !== 6}
              className="h-10 mt-4"
            >
              {isProcessing ? (
                <>
                  <Spinner
                    className="size-4 inline-block"
                    variant="circle-filled"
                  />
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
              className="h-10 mt-2"
            >
              Back to Email
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
