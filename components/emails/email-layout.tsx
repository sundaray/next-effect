import React from "react";
import { Html, Head, Preview, Body, Tailwind } from "@react-email/components";

type EmailLayoutProps = {
  previewText: string;
  children: React.ReactNode;
};

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-neutral-100 font-sans">
          <div className="container mx-auto p-8 bg-white max-w-lg">
            {children}
          </div>
        </Body>
      </Tailwind>
    </Html>
  );
}
