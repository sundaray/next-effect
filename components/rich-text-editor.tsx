import { useId } from "react";
import { getFieldErrorId } from "@/lib/utils";
import {
  type Editor,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading3,
  Scroll,
} from "lucide-react";
import {
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
  FieldPath,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const Toolbar = ({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled: boolean;
}) => {
  const {
    isBold = false,
    isItalic = false,
    isH3 = false,
    isBulletList = false,
    isOrderedList = false,
  } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor?.isActive("bold"),
      isItalic: editor?.isActive("italic"),
      isH3: editor?.isActive("heading", { level: 3 }),
      isBulletList: editor?.isActive("bulletList"),
      isOrderedList: editor?.isActive("orderedList"),
    }),
  }) || {};

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-2 border border-neutral-300 border-b-0 rounded-t-md",
        disabled && "opacity-50"
      )}
    >
      {/* Bold Button */}
      <Button
        type="button"
        size="sm"
        variant={isBold ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </Button>

      {/* Italic Button */}
      <Button
        type="button"
        size="sm"
        variant={isItalic ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={
          disabled || !editor.can().chain().focus().toggleItalic().run()
        }
      >
        <Italic className="size-4" />
      </Button>

      {/* Heading 3 Button */}
      <Button
        type="button"
        size="sm"
        variant={isH3 ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        disabled={
          disabled ||
          !editor.can().chain().focus().toggleHeading({ level: 3 }).run()
        }
      >
        <Heading3 className="size-4" />
      </Button>

      {/* Bullet List Button */}
      <Button
        type="button"
        size="sm"
        variant={isBulletList ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={
          disabled || !editor.can().chain().focus().toggleBulletList().run()
        }
      >
        <List className="size-4" />
      </Button>

      {/* Ordered List Button */}
      <Button
        type="button"
        size="sm"
        variant={isOrderedList ? "secondary" : "ghost"}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={
          disabled || !editor.can().chain().focus().toggleOrderedList().run()
        }
      >
        <ListOrdered className="size-4" />
      </Button>
    </div>
  );
};

type RichTextEditorProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  id: string;
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  disabled: boolean;
};

export function RichTextEditor<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  id,
  field,
  fieldState,
  disabled,
}: RichTextEditorProps<TFieldValues, TName>) {
  const randomId = useId();
  const fieldErrorId = getFieldErrorId(field.name, randomId);
  const fieldError = fieldState.error;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3],
        },
      }),
    ],
    content: (field.value as string) || "",
    onUpdate({ editor }) {
      const html = editor.isEmpty ? "" : editor.getHTML();
      field.onChange(html);
    },
    onBlur() {
      field.onBlur();
    },
    editorProps: {
      attributes: {
        id,
        class: cn(
          "prose prose-neutral prose-sm outline-none px-3 py-2 min-h-[240px] rounded-b-md"
        ),
      },
    },
    editable: !disabled,
  });

  return (
    <div className="mt-2">
      <Toolbar editor={editor} disabled={!!disabled} />
      <ScrollArea
        className={cn(
          "h-[240px] w-full text-sm",
          "border border-neutral-300 rounded-b-md bg-transparent shadow-xs",
          "transition-[color,box-shadow]",
          // Normal focus styles
          "has-[.tiptap:focus-visible]:border-ring",
          "has-[.tiptap:focus-visible]:ring-ring/50",
          "has-[.tiptap:focus-visible]:ring-[3px]",
          // Error styles (override focus styles when there's an error)
          fieldError && "border-destructive",
          fieldError && "has-[.tiptap:focus-visible]:border-destructive",
          fieldError && "has-[.tiptap:focus-visible]:ring-destructive/20",
          // Disabled styles
          disabled && "pointer-events-none cursor-not-allowed opacity-50"
        )}
      >
        <EditorContent
          editor={editor}
          aria-invalid={fieldError ? "true" : "false"}
          aria-describedby={fieldError ? fieldErrorId : undefined}
        />
      </ScrollArea>
    </div>
  );
}
