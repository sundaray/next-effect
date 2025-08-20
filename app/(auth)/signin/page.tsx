import { Suspense } from "react";
import { SignInWitjGoogleForm } from "@/components/signin-with-google-form";
import { SignInWithEmailOtpForm } from "@/components/signin-with-email-otp-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignIn() {
  return (
    <div>
      <h2 className="text-center text-2xl font-semibold tracking-tight text-neutral-900">
        Welcome
      </h2>
      <p className="text-center text-neutral-700 mt-1">
        Sign in to your account
      </p>
      <Suspense>
        <div className="mt-8 grid gap-4 bg-neutral-100 border sm:rounded-lg px-5 py-10 sm:px-10 sm:mx-auto sm:w-full sm:max-w-[420px]">
          <SignInWitjGoogleForm />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm text-neutral-500">
              <span className="bg-neutral-100 px-2">or continue with</span>
            </div>
          </div>
          <SignInWithEmailOtpForm />
        </div>
      </Suspense>
    </div>
  );
}
