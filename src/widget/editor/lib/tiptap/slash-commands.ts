import { Extension } from "@tiptap/core";

export const SlashCommands = Extension.create({
  name: "slashCommands",
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-7": () => this.editor.chain().focus().toggleOrderedList().run(),
    };
  },
});
