"use client";

import { useMemo } from "react";
import type { SavedSnapshot } from "../model/types";

export function useDirtyState(title: string, serializedContent: string, saved: SavedSnapshot) {
  return useMemo(
    () => title !== saved.title || serializedContent !== saved.serializedContent,
    [saved, serializedContent, title],
  );
}
