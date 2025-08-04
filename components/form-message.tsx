import { cn } from "@/lib/utils";

type FormMessageProps = {
  message: string | null;
  type: "success" | "error";
};

export function FormMessage({ message, type }: FormMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md p-3 my-4",
        type === "error" && "bg-red-100 border border-red-200",
        type === "success" && "bg-green-100 border border-green-200"
      )}
    >
      <p
        className={cn(
          "text-sm",
          type === "error" && "text-red-800",
          type === "success" && "text-green-800"
        )}
      >
        {message}
      </p>
    </div>
  );
}
