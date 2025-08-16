"use client";

import Link from "next/link";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { FormMessage } from "@/components/form-message";
import { FormFieldErrorMessage } from "@/components/form-field-error-message";


export function SignInWithEmailOtpForm({ next }: { next: string }) {


  return (
    <form {...getFormProps(form)} action={formAction}>
      {form.errors && <FormErrorMessage error={form.errors[0]} />}
      <div className={`grid gap-1 ${form.errors ? "mt-4" : ""}`}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            {...getInputProps(fields.email, { type: "email" })}
            className="mt-2"
          />
          <FormFieldErrorMessage
            id={fields.email.errorId}
            name={fields.email.name}
            errors={fields.email.errors}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-sky-600 hover:underline hover:underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 rounded-full"
        >
          {isPending ? (
            <>
              <Icons.loader className="size-3 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>
    </form>
  );
}
