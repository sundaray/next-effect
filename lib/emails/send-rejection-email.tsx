import { RejectionEmailTemplate } from "@/components/emails/rejection-email-template";
import { EmailService } from "@/lib/services/email-service";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";
import { Config, Data, Effect } from "effect";
import "server-only";

class EmailTemplateRenderError extends Data.TaggedError(
  "EmailTemplateRenderError",
)<{ cause: unknown }> {}

type SendRejectionEmailParams = {
  to: string;
  appName: string;
  reason: string;
};

export function sendRejectionEmail(params: SendRejectionEmailParams) {
  return Effect.gen(function* () {
    const emailService = yield* EmailService;
    const emailFrom = yield* Config.string("EMAIL_FROM");
    const baseUrl = yield* Config.string("NEXT_PUBLIC_BASE_URL");

    const dashboardLink = `${baseUrl}/dashboard`;

    const emailHtml = yield* Effect.tryPromise({
      try: () =>
        render(
          <RejectionEmailTemplate
            appName={params.appName}
            reason={params.reason}
            dashboardLink={dashboardLink}
          />,
        ),
      catch: (error) => new EmailTemplateRenderError({ cause: error }),
    });

    const emailInput: SendEmailCommandInput = {
      Destination: { ToAddresses: [params.to] },
      Message: {
        Body: { Html: { Charset: "UTF-8", Data: emailHtml } },
        Subject: {
          Charset: "UTF-8",
          Data: `An update on your app submission for ${params.appName}`,
        },
      },
      Source: emailFrom,
    };

    const command = new SendEmailCommand(emailInput);
    yield* emailService.use((client) => client.send(command));
  }).pipe(Effect.tapError((error) => Effect.logError(error)));
}
