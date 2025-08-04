import { useId } from "react";
import { useDropzone } from "react-dropzone";
import {
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { FileImage as FileImageIcon, X } from "lucide-react";
import { getFieldErrorId } from "@/lib/utils";
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
}: DropzoneInputProps<TFieldValues, TName>) {
  const id = useId();
  const fieldErrorId = getFieldErrorId(field.name, id);
  const fieldError = fieldState.error;

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      field.onChange(acceptedFiles[0]);
    }
  };

  const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
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
            isDragActive && "border-green-500 bg-green-50",
            isDragReject && "border-red-500 bg-red-50",
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

      {selectedFile && !fieldError && (
        <div className="flex items-center justify-between rounded-md border bg-neutral-700 p-2">
          <div className="flex items-center gap-2">
            <FileImageIcon className="size-5 text-neutral-300" />
            <div className="flex flex-col text-sm">
              <span className="font-medium text-neutral-100">
                {selectedFile.name}
              </span>
              <span className="text-xs text-neutral-100">
                {formatBytes(selectedFile.size)}
              </span>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-10 rounded-full text-neutral-500 hover:text-neutral-300 hover:bg-neutral-600"
            onClick={handleRemoveFile}
            disabled={disabled}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
