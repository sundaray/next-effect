import "server-only";
import { Effect, Config, Data } from "effect";
import { render } from "@react-email/render";
import { EmailService } from "@/lib/services/email-service";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { ApprovalEmailTemplate } from "@/components/emails/approval-email-template";

class EmailTemplateRenderError extends Data.TaggedError(
  "EmailTemplateRenderError"
)<{ cause: unknown }> {}

type SendApprovalEmailParams = {
  to: string;
  appName: string;
  slug: string;
};

export function sendApprovalEmail(params: SendApprovalEmailParams) {
  return Effect.gen(function* () {
    const emailService = yield* EmailService;
    const emailFrom = yield* Config.string("EMAIL_FROM");
    const baseUrl = yield* Config.string("NEXT_PUBLIC_BASE_URL");

    const toolLink = `${baseUrl}/tools/${params.slug}`;

    const emailHtml = yield* Effect.tryPromise({
      try: () =>
        render(
          <ApprovalEmailTemplate appName={params.appName} toolLink={toolLink} />
        ),
      catch: (error) => new EmailTemplateRenderError({ cause: error }),
    });

    const emailInput: SendEmailCommandInput = {
      Destination: { ToAddresses: [params.to] },
      Message: {
        Body: { Html: { Charset: "UTF-8", Data: emailHtml } },
        Subject: {
          Charset: "UTF-8",
          Data: `Congratulations! Your app ${params.appName} has been approved`,
        },
      },
      Source: emailFrom,
    };

    const command = new SendEmailCommand(emailInput);
    yield* emailService.use((client) => client.send(command));
  }).pipe(Effect.tapError((error) => Effect.logError(error)));
}
