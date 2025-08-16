import { cn } from "@/lib/utils";

type FormFieldErrorMessageProps = {
  id: string;
  name: string;
  errors?: string[] | null;
  className?: string;
};

export function FormFieldErrorMessage({
  id,
  name,
  errors,
  className,
}: FormFieldErrorMessageProps) {
  if (!errors || errors.length === 0) {
    return <div className="min-h-7"></div>;
  }

  const isPasswordValidationError =
    name === "password" &&
    errors.length > 0 &&
    errors[0] !== "Password is required";

  return (
    <div id={id} className={cn("text-sm text-red-600", className)}>
      {isPasswordValidationError ? (
        <>
          <p>Password must:</p>
          <ul className="list-disc space-y-1 pl-8">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </>
      ) : (
        <div className="min-h-7 flex items-center ease-out animate-in fade-in-0">
          <p>{errors[0]}</p>
        </div>
      )}
    </div>
  );
}
