import { Hono } from "hono";
import { Effect, Data, pipe } from "effect";
import { serverRuntime } from "@/lib/server-runtime";
import { DatabaseService } from "@/lib/services/database-service";
import { tools, toolHistory, users } from "@/db/schema";
import { sendSubmissionUpdateEmail } from "@/lib/send-submission-update-email";
import { eq } from "drizzle-orm";
import type { AuthType } from "@/lib/services/auth-service";

class ToolNotFoundError extends Data.TaggedError("ToolNotFoundError") {}
class SubmitterEmailNotFoundError extends Data.TaggedError(
  "SubmitterEmailNotFoundError"
) {}

const app = new Hono<{
  Variables: AuthType;
}>();

// -----------------------------------------------

//  POST /submissions/:id/approve

// -----------------------------------------------
app
  .post("/submissions/:id/approve", async (ctx) => {
    const toolId = ctx.req.param("id");
    const admin = ctx.get("user");

    const program = Effect.gen(function* () {
      const dbService = yield* DatabaseService;

      const [toolDetails] = yield* dbService.use((db) =>
        db
          .select({
            name: tools.name,
            slug: tools.slug,
            submittedByEmail: users.email,
          })
          .from(tools)
          .leftJoin(users, eq(tools.submittedBy, users.id))
          .where(eq(tools.id, toolId))
          .limit(1)
      );

      if (!toolDetails) return yield* Effect.fail(new ToolNotFoundError());
      if (!toolDetails.submittedByEmail)
        return yield* Effect.fail(new SubmitterEmailNotFoundError());

      yield* dbService.use((db) =>
        db
          .update(tools)
          .set({ adminApprovalStatus: "approved", approvedAt: new Date() })
          .where(eq(tools.id, toolId))
      );
      yield* dbService.use((db) =>
        db.insert(toolHistory).values({
          toolId: toolId,
          userId: admin!.id,
          eventType: "approved",
        })
      );
      yield* sendSubmissionUpdateEmail({
        type: "approval",
        to: toolDetails.submittedByEmail,
        appName: toolDetails.name,
        slug: toolDetails.slug,
      });

      return ctx.json({ success: true });
    });

    const handledProgram = pipe(
      program,
      Effect.catchTag("ToolNotFoundError", () =>
        Effect.succeed(ctx.json({ error: "Tool not found" }, 404))
      ),
      Effect.catchTag("SubmitterEmailNotFoundError", () =>
        Effect.succeed(ctx.json({ error: "Submitter email not found" }, 404))
      ),
      Effect.catchAll((error) => {
        console.error("Error approving submission:", error);
        return Effect.succeed(
          ctx.json({ error: "Internal Server Error" }, 500)
        );
      }),
      Effect.ensureErrorType<never>()
    );

    return serverRuntime.runPromise(handledProgram);
  })

  // -----------------------------------------------

  //  POST /submissions/:id/reject

  // -----------------------------------------------

  .post("/submissions/:id/reject", async (ctx) => {
    const toolId = ctx.req.param("id");
    const { reason } = await ctx.req.json();
    const admin = ctx.get("user");

    if (!reason || typeof reason !== "string" || reason.trim() === "") {
      return ctx.json({ error: "Reason for rejection is required." }, 400);
    }

    const program = Effect.gen(function* () {
      const dbService = yield* DatabaseService;

      const [toolDetails] = yield* dbService.use((db) =>
        db
          .select({
            name: tools.name,
            submittedByEmail: users.email,
          })
          .from(tools)
          .leftJoin(users, eq(tools.submittedBy, users.id))
          .where(eq(tools.id, toolId))
          .limit(1)
      );

      if (!toolDetails) return yield* Effect.fail(new ToolNotFoundError());
      if (!toolDetails.submittedByEmail)
        return yield* Effect.fail(new SubmitterEmailNotFoundError());

      yield* dbService.use((db) =>
        db
          .update(tools)
          .set({ adminApprovalStatus: "rejected" })
          .where(eq(tools.id, toolId))
      );
      yield* dbService.use((db) =>
        db.insert(toolHistory).values({
          toolId: toolId,
          userId: admin!.id,
          eventType: "rejected",
          reason: reason,
        })
      );
      yield* sendSubmissionUpdateEmail({
        type: "rejection",
        to: toolDetails.submittedByEmail,
        appName: toolDetails.name,
        reason: reason,
      });

      return ctx.json({ success: true });
    });

    const handledProgram = pipe(
      program,
      Effect.catchTag("ToolNotFoundError", () =>
        Effect.succeed(ctx.json({ error: "Tool not found" }, 404))
      ),
      Effect.catchTag("SubmitterEmailNotFoundError", () =>
        Effect.succeed(ctx.json({ error: "Submitter email not found" }, 404))
      ),
      Effect.catchAll((error) => {
        console.error("Error rejecting submission:", error);
        return Effect.succeed(
          ctx.json({ error: "Internal Server Error" }, 500)
        );
      })
    );

    return serverRuntime.runPromise(handledProgram);
  });

export default app;
