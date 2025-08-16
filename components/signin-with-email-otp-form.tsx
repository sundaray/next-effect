"use client";

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

  async function onSubmit(data: SignInWithEmailOtpFormSchemaType) {}

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
