type FormFieldMessageProps = {
  errorMessage: string | undefined;
  errorId: string;
};

export function FormFieldMessage({
  errorMessage,
  errorId,
}: FormFieldMessageProps) {
  if (!errorMessage) {
    return <div className="w-full min-h-6" />;
  }

  return (
    <div className="w-full min-h-6 flex items-center">
      <p
        id={errorId}
        role="alert"
        className="text-sm text-red-600 mt-1 ease-out animate-in fade-in-0"
      >
        {errorMessage}
      </p>
    </div>
  );
}
