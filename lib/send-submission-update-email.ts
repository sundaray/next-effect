import "server-only";

import { Effect, Config, Data } from "effect";
import { render } from "@react-email/render";
import { EmailService } from "@/lib/services/email-service";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { ensureAbsoluteUrl } from "./utils";

// --- Email Templates ---

function ApprovalEmailTemplate(appName: string, toolLink: string) {
  return `
    <p>Hi,</p>
    <p>We're excited to let you know that your submission for <strong>${appName}</strong> has been reviewed and approved!</p>
    <p>It is now live in our directory and visible to all users. You can view your listing here:</p>
    <a href="${toolLink}">${toolLink}</a>
    <p>Thank you for contributing to our community.</p>
    <p>The IndieAITools Team</p>
  `;
}

function RejectionEmailTemplate(appName: string, reason: string) {
  const dashboardLink = ensureAbsoluteUrl("/dashboard");
  return `
    <p>Hi,</p>
    <p>Thank you for your submission of <strong>${appName}</strong>. After reviewing your app, we are unable to approve it at this time.</p>
    <p><strong>Reason for rejection:</strong></p>
    <p>${reason}</p>
    <p>Please review the feedback above, make the necessary changes, and feel free to resubmit your app through your dashboard.</p>
    <a href="${dashboardLink}">${dashboardLink}</a>
    <p>We look forward to seeing your updated submission.</p>
    <p>The IndieAITools Team</p>
  `;
}

// --- Email Sending Logic ---

class EmailTemplateRenderError extends Data.TaggedError(
  "EmailTemplateRenderError"
)<{ cause: unknown }> {}

type SendEmailParams = {
  to: string;
  appName: string;
} & (
  | { type: "approval"; slug: string }
  | { type: "rejection"; reason: string }
);

export function sendSubmissionUpdateEmail(params: SendEmailParams) {
  return Effect.gen(function* () {
    const emailService = yield* EmailService;
    const emailFrom = yield* Config.string("EMAIL_FROM");

    let subject = "";
    let bodyHtml = "";

    if (params.type === "approval") {
      subject = `Congratulations! Your app ${params.appName} has been approved.`;
      const toolLink = ensureAbsoluteUrl(`/tools/${params.slug}`);
      bodyHtml = ApprovalEmailTemplate(params.appName, toolLink);
    } else {
      subject = `An update on your app submission for ${params.appName}`;
      bodyHtml = RejectionEmailTemplate(params.appName, params.reason);
    }

    const emailInput: SendEmailCommandInput = {
      Destination: { ToAddresses: [params.to] },
      Message: {
        Body: { Html: { Charset: "UTF-8", Data: bodyHtml } },
        Subject: { Charset: "UTF-8", Data: subject },
      },
      Source: emailFrom,
    };

    const command = new SendEmailCommand(emailInput);
    yield* emailService.use((client) => client.send(command));
  }).pipe(
    Effect.tapError((error) => Effect.logError("Email sending error:", error))
  );
}
