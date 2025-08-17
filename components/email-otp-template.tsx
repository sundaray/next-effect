import React from "react";

import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";

export function EmailOtpTemplate(otp: string) {
  return (
    <Html>
      <Tailwind>
        <Text className="text-base font-medium text-neutral-700">Hello,</Text>
        <Text className="text-base font-medium text-neutral-700">
          Use the following OTP to complete your sign-in:
        </Text>
        <Text className="text-2xl font-bold text-neutral-900 tracking-wider">
          {otp}
        </Text>
        <Text className="text-base font-medium text-neutral-700">
          The OTP will expire in 5 minutes.
        </Text>
        <Text className="text-sm font-medium text-neutral-500">
          If you did not request this OTP, you can safely ignore this email.
        </Text>
      </Tailwind>
    </Html>
  );
}
