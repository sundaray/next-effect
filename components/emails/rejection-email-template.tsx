import React from "react";
import { Heading, Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "@/components/emails/email-layout";

type RejectionEmailProps = {
  appName: string;
  reason: string;
  dashboardLink: string;
};

export function RejectionEmailTemplate({
  appName,
  reason,
  dashboardLink,
}: RejectionEmailProps) {
  return (
    <EmailLayout previewText={`An update on your submission for ${appName}`}>
      <Heading className="text-2xl font-bold text-neutral-900">
        Update on Your Submission
      </Heading>
      <Text className="text-base text-neutral-700">Hi,</Text>
      <Text className="text-base text-neutral-700">
        Thank you for your submission of <strong>{appName}</strong>. After
        reviewing your app, we are unable to approve it at this time for the
        following reason:
      </Text>
      <Text className="text-base italic bg-neutral-100 p-4 border-l-4 border-neutral-300 my-4">
        {reason}
      </Text>
      <Text className="text-base text-neutral-700">
        Please review the feedback, make the necessary changes, and feel free to
        resubmit your app through your dashboard.
      </Text>
      <Section className="text-center my-6">
        <Button
          className="bg-sky-600 text-white font-semibold rounded-md px-6 py-3"
          href={dashboardLink}
        >
          Go to Dashboard
        </Button>
      </Section>
      <Text className="text-base text-neutral-700">
        Best,
        <br />
        Hemanta Sundaray
      </Text>
    </EmailLayout>
  );
}
