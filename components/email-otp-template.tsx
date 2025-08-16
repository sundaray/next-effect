import * as React from "react";

import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";

export function EmailOtpTemplate(otp: string) {
  return (
    <Html>
      <Tailwind>
        <Text className="text-base font-medium text-gray-700">Hi,</Text>
        <Text className="text-base font-medium text-gray-700">
          Your verification code is:
        </Text>
        <Text className="text-2xl font-bold text-gray-900 tracking-widest bg-gray-100 px-4 py-2 rounded-lg text-center">
          {otp}
        </Text>
        <Text className="text-base font-medium text-gray-700">
          This code will expire in 5 minutes.
        </Text>
        <Text className="text-sm font-medium text-gray-500">
          If you did not request this code, you can safely ignore this email.
        </Text>
      </Tailwind>
    </Html>
  );
}
