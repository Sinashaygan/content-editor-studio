"use client";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";

const Btn = ({
  label,
  onClick,
  isActive,
}: {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}) => (
  <Button
    type="button"
    size="sm"
    variant={isActive ? "default" : "outline"}
    onClick={onClick}
  >
    {label}
  </Button>
);

export function EditorToolbar({
  editor,
  onImage,
}: {
  editor: Editor | null;
  onImage: () => void;
}) {
  if (!editor) return null;
  const run = (fn: () => boolean) => {
    fn();
  };
  const active = (name: string, attrs?: Record<string, unknown>) =>
    editor.isActive(name, attrs);
  
  const link = () => {
    if (active("link")) editor.chain().focus().unsetLink().run();
    else {
      const href = window.prompt("URL");
      if (href)
        editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
  };
  const table = active("table");
  return (
    <div className="flex flex-wrap gap-1 border-b bg-neutral-50 p-2" dir="rtl">
      <Btn
        label="P"
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={active("paragraph")}
      />
      <Btn
        label="H1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={active("heading", { level: 1 })}
      />
      <Btn
        label="H2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={active("heading", { level: 2 })}
      />
      <Btn
        label="H3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={active("heading", { level: 3 })}
      />
      <Btn
        label="B"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={active("bold")}
      />
      <Btn
        label="I"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={active("italic")}
      />
      <Btn
        label="U"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={active("underline")}
      />
      <Btn
        label="S"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={active("strike")}
      />
      <Btn
        label="Highlight"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={active("highlight")}
      />
      <Btn
        label="• List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={active("bulletList")}
      />
      <Btn
        label="1. List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={active("orderedList")}
      />
      <Btn
        label="Task"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={active("taskList")}
      />
      <Btn
        label="Left"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={active({ textAlign: "left" } as never)}
      />
      <Btn
        label="Center"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <Btn
        label="Right"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />
      <Btn
        label="Justify"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      />
      <Btn label="Link" onClick={link} isActive={active("link")} />
      <Btn
        label="Table"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 4, withHeaderRow: true })
            .run()
        }
      />
      <Btn
        label="Undo"
        onClick={() => run(() => editor.chain().focus().undo().run())}
      />
      <Btn
        label="Redo"
        onClick={() => run(() => editor.chain().focus().redo().run())}
      />
      <Btn label="Image" onClick={onImage} />
      {table && (
        <>
          <Btn
            label="↑ Row"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          />
          <Btn
            label="↓ Row"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          />
          <Btn
            label="− Row"
            onClick={() => editor.chain().focus().deleteRow().run()}
          />
          <Btn
            label="← Col"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          />
          <Btn
            label="→ Col"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          />
          <Btn
            label="− Col"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          />
          <Btn
            label="Header"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          />
          <Btn
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          />
        </>
      )}
    </div>
  );
}
