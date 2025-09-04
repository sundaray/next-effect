import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

type FormMessageProps = {
  message: string | null;
  type: "success" | "error";
};

export function FormMessage({ message, type }: FormMessageProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key="form-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            ease: "easeOut",
            duration: 0.15,
          }}
          layout
          className={cn(
            "mb-4 rounded-md px-3 py-2",
            type === "error" && "border border-red-200 bg-red-100",
            type === "success" && "border border-green-200 bg-green-100",
          )}
        >
          <p
            className={cn(
              "text-sm",
              type === "error" && "text-red-800",
              type === "success" && "text-green-800",
            )}
          >
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
