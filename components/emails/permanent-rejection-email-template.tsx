import React from "react";
import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./email-layout";

type PermanentRejectionEmailProps = {
  appName: string;
  reason: string;
};

export function PermanentRejectionEmailTemplate({
  appName,
  reason,
}: PermanentRejectionEmailProps) {
  return (
    <EmailLayout
      previewText={`Final decision on your submission for ${appName}`}
    >
      <Heading className="text-2xl font-bold text-neutral-900">
        Final Decision on Your Submission
      </Heading>
      <Text className="text-base text-neutral-700">Hi,</Text>
      <Text className="text-base text-neutral-700">
        This email is to inform you about the final status of your submission
        for <strong>{appName}</strong>.
      </Text>
      <Text className="text-base text-neutral-700">
        The submission has been reviewed after multiple attempts and has now
        reached the maximum number of resubmissions allowed. As a result, it is
        now considered permanently rejected and can no longer be updated.
      </Text>
      <Text className="text-base text-neutral-700 mt-4">
        <strong>Final reason for rejection:</strong>
      </Text>
      <Text className="text-base italic bg-neutral-100 p-4 border-l-4 border-neutral-300 my-4">
        {reason}
      </Text>
      <Text className="text-base text-neutral-700">
        We appreciate your interest and effort. You are welcome to submit other
        new tools that meet our guidelines in the future.
      </Text>
      <Text className="text-base text-neutral-700 mt-4">
        Best,
        <br />
        Hemanta Sundaray
      </Text>
    </EmailLayout>
  );
}
