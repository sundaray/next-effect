import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
} from "@react-email/components";
import React from "react";

type EmailLayoutProps = {
  previewText: string;
  children: React.ReactNode;
};

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Tailwind>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-neutral-100 font-sans">
          <Container className="my-8 max-w-lg bg-white p-8">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
