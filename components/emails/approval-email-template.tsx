import { Button, Section, Text } from "@react-email/components";
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
      <Text className="text-base text-neutral-700">Hi,</Text>
      <Text className="text-base text-neutral-700">
        I'm excited to let you know that your submission for{" "}
        <strong>{appName}</strong> has been reviewed and approved!
      </Text>
      <Text className="text-base text-neutral-700">
        It is now live in our directory. You can view your listing here:
      </Text>
      <Section className="my-6 text-center">
        <Button
          className="rounded-md bg-sky-600 px-6 py-3 font-semibold text-white"
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
