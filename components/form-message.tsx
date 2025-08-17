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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          layout
          className={cn(
            "rounded-md px-3 py-2",
            type === "error" && "bg-red-100 border border-red-200",
            type === "success" && "bg-green-100 border border-green-200"
          )}
        >
          <motion.p
            className={cn(
              "text-sm",
              type === "error" && "text-red-800",
              type === "success" && "text-green-800"
            )}
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
