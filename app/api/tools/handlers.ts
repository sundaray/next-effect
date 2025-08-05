import { HttpApiBuilder } from "@effect/platform";
import { toolsApi } from "@/app/api/tools/api";
import { Effect } from "effect";

const dummyUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

export const submitToolHandler = HttpApiBuilder.handler(
  toolsApi,
  "tools",
  "submitTool",
  ({ request }) =>
    Effect.gen(function* () {
      return dummyUsers;
    })
);
