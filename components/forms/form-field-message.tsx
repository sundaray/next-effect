type FormFieldMessageProps = {
  errorMessage: string | undefined;
  errorId: string;
};

export function FormFieldMessage({
  errorMessage,
  errorId,
}: FormFieldMessageProps) {
  if (!errorMessage) {
    return <div className="min-h-6 w-full" />;
  }

  return (
    <div className="flex min-h-6 w-full items-center">
      <p
        id={errorId}
        role="alert"
        className="mt-1 animate-in text-sm text-red-600 ease-out fade-in-0 slide-in-from-left-2"
      >
        {errorMessage}
      </p>
    </div>
  );
}
