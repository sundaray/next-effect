import { Suspense } from "react";
import { SignInWitjGoogleForm } from "@/components/signin-with-google-form";
import { SignInWithEmailOtpForm } from "@/components/signin-with-email-otp-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignIn() {
  return (
    <div className="my-36 px-4 mx-auto max-w-[440px]">
      <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900">
        Welcome
      </h2>
      <p className="text-center text-neutral-700 mt-2">
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
