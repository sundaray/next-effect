import { motion, AnimatePresence } from "motion/react";
import { useDropzone, FileRejection } from "react-dropzone";
import {
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
  FieldPath,
  UseFormSetError,
  UseFormClearErrors,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { FileImage as FileImageIcon, X } from "lucide-react";
import { PhotoIcon } from "@heroicons/react/24/solid";

type DropzoneInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
  maxSizeInMb: number;
  supportedFileTypes: string[];
  supportedMimeTypes: string[];
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  fieldErrorId: string;
};

export function DropzoneInput<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  field,
  fieldState,
  disabled,
  maxSizeInMb,
  supportedFileTypes,
  supportedMimeTypes,
  setError,
  clearErrors,
  fieldErrorId,
}: DropzoneInputProps<TFieldValues, TName>) {
  const fieldError = fieldState.error;

  const onDrop = (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const firstRejection = fileRejections[0];
      const firstError = firstRejection.errors[0];

      let message = firstError.message;
      if (firstError.code === "file-too-large") {
        message = `File size must be less than ${maxSizeInMb}MB.`;
      } else if (firstError.code === "file-invalid-type") {
        message = `Invalid file type. Supported types are ${supportedFileTypes.join(
          ", "
        )}.`;
      }

      clearErrors(field.name);

      field.onChange(null);

      setTimeout(() => {
        setError(field.name, { type: "manual", message });
      }, 0);

      return;
    }

    if (acceptedFiles.length > 0) {
      clearErrors(field.name);
      field.onChange(acceptedFiles[0]);
    }
  };

  const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      multiple: false,
      disabled,
      noClick: false,
      accept: supportedMimeTypes.reduce(
        (acc, mimeType) => {
          acc[mimeType] = [];
          return acc;
        },
        {} as Record<string, string[]>
      ),
      maxSize: maxSizeInBytes,
    });

  const selectedFile: File | null = field.value;

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    field.onChange(null);
    clearErrors(field.name);
  };

  return (
    <div className="mt-2 grid gap-2">
      <div
        {...getRootProps({
          role: "button",
          "aria-invalid": fieldError ? "true" : "false",
          "aria-describedby": fieldError ? fieldErrorId : undefined,
          className: cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-md border-1 border-dashed aria-invalid:border-destructive aria-invalid:ring-destructive/20 border-neutral-300 p-12 text-center transition-colors",
            isDragActive && !isDragReject && "border-green-500",
            isDragReject && "border-red-500",
            disabled && "cursor-not-allowed pointer-events-none opacity-50"
          ),
        })}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="mb-2 size-10 text-neutral-300" />
        <p className="mb-4 text-sm text-neutral-700">
          Drag 'n' drop file here or click to select file
        </p>
        <p className="text-xs text-neutral-500">
          Supported file types: {supportedFileTypes.join(", ")}
        </p>
        <p className="text-xs text-neutral-500">
          Max. file size: {maxSizeInMb}MB
        </p>
      </div>

      <AnimatePresence>
        {selectedFile && !fieldError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex items-center justify-between rounded-md border bg-neutral-200 p-2"
          >
            {" "}
            <div className="flex items-center gap-2">
              <FileImageIcon className="size-5 text-neutral-500" />
              <div className="flex flex-col text-sm">
                <span className="font-medium text-neutral-700">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-neutral-500">
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-10 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-300/50"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <X className="size-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
