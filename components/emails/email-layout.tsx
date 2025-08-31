import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Tailwind,
  Container,
} from "@react-email/components";

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
          <Container className="p-8 bg-white my-8 max-w-lg">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
