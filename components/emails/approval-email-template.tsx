import React from "react";
import { Heading, Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./email-layout";

type ApprovalEmailProps = {
  appName: string;
  toolLink: string;
};

export function ApprovalEmailTemplate({
  appName,
  toolLink,
}: ApprovalEmailProps) {
  return (
    <EmailLayout
      previewText={`Your submission for ${appName} has been approved!`}
    >
      <Heading className="text-2xl font-bold text-neutral-900">
        Submission Approved!
      </Heading>
      <Text className="text-base text-neutral-700">Hi,</Text>
      <Text className="text-base text-neutral-700">
        I'm excited to let you know that your submission for{" "}
        <strong>{appName}</strong> has been reviewed and approved!
      </Text>
      <Text className="text-base text-neutral-700">
        It is now live in our directory. You can view your listing here:
      </Text>
      <Section className="text-center my-6">
        <Button
          className="bg-sky-600 text-white font-semibold rounded-md px-6 py-3"
          href={toolLink}
        >
          View Your Listing
        </Button>
      </Section>
      <Text className="text-base text-neutral-700">
        Thank you for contributing to our community.
      </Text>
      <Text className="text-base text-neutral-700">
        Best,
        <br />
        Hemanta Sundaray
      </Text>
    </EmailLayout>
  );
}
