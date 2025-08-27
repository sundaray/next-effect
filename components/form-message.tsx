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
            duration: 0.2,
          }}
          layout
          className={cn(
            "rounded-md px-3 py-2",
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
