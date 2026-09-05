"use client";
import { type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Button } from "@/components/ui/button";

export function EditorBubbleMenu({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e }: { editor: Editor }) =>
        !e.isActive("table") && !e.isActive("image") && !e.state.selection.empty
      }
    >
      <div className="flex gap-1 rounded-md border bg-neutral-900 p-1">
        <Button
          size="sm"
          variant={editor.isActive("bold") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("italic") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("underline") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </Button>
        <Button
          size="sm"
          variant={editor.isActive("link") ? "default" : "outline"}
          onClick={() => {
            const href = window.prompt("URL");
            if (href)
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href })
                .run();
          }}
        >
          Link
        </Button>
      </div>
    </BubbleMenu>
  );
}
