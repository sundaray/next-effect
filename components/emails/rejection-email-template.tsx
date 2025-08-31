import React from "react";
import { Text, Section } from "@react-email/components";
import { EmailLayout } from "@/components/emails/email-layout";

type RejectionEmailProps = {
  appName: string;
  reason: string;
};

export function RejectionEmailTemplate({
  appName,
  reason,
}: RejectionEmailProps) {
  return (
    <EmailLayout previewText={`An update on your submission for ${appName}`}>
      <Text className="text-base text-neutral-700">Hi,</Text>
      <Text className="text-base text-neutral-700">
        Thank you for your submission of <strong>{appName}</strong>.
      </Text>
      <Text className="text-base text-neutral-700">
        After reviewing your app, I am unable to approve it at this time for the
        following reason:
      </Text>
      <Section
        className="my-4 text-base bg-neutral-100 p-4"
        style={{ borderLeft: "4px solid #a3a3a3" }}
      >
        {reason}
      </Section>
      <Text className="text-base text-neutral-700">
        Please review the feedback, make the necessary changes, and feel free to
        resubmit your app.
      </Text>
      <Text className="text-base text-neutral-700">
        Best,
        <br />
        Hemanta Sundaray
      </Text>
    </EmailLayout>
  );
}
