"use client";

import { useForm, Controller } from "react-hook-form";
import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { FormMessage } from "@/components/form-message";
import { FormFieldErrorMessage } from "@/components/form-field-error-message";
import {
  SignInWithEmailOtpFormSchemaType,
  SignInWithEmailOtpFormSchema,
} from "@/lib/schema";

export function SignInWithEmailOtpForm({ next }: { next: string }) {
  const [isPending, setIsPending] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInWithEmailOtpFormSchemaType>({
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: SignInWithEmailOtpFormSchemaType) {
    setIsPending(true);
    setFormErrors([]);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={`grid gap-4 ${formErrors.length > 0 ? "mt-4" : ""}`}>
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
                placeholder="Enter your email address"
              />
            )}
          />
          {errors.email && (
            <FormFieldErrorMessage
              id="email-error"
              name="email"
              errors={[errors.email.message || ""]}
            />
          )}
        </div>

        <Button type="submit" disabled={isPending} className="h-10">
          {isPending ? (
            <>
              <Icons.loader className="size-3 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
      </div>
    </form>
  );
}
