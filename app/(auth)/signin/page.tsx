import { SignInWithEmailOtpForm } from "@/components/auth/signin-with-email-otp-form";
import { SignInWitjGoogleForm } from "@/components/auth/signin-with-google-form";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignIn() {
  return (
    <div className="mx-auto my-36 max-w-[440px] px-4">
      <h2 className="text-center text-4xl font-bold tracking-tight text-neutral-900">
        Welcome
      </h2>
      <p className="mt-4 text-center text-neutral-700">
        Sign in to your account
      </p>
      <Suspense>
        <div className="mt-12 grid gap-4">
          <SignInWitjGoogleForm />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm text-neutral-500">
              <span className="bg-neutral-50 px-2">or continue with</span>
            </div>
          </div>
          <SignInWithEmailOtpForm />
        </div>
      </Suspense>
    </div>
  );
}
