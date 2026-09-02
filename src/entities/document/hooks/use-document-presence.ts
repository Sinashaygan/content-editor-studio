"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/api/supabase";

export interface PresenceUser {
  userId: string;
  userName: string;
  color: string;
  lastSeen: number;
}

interface StoredPresenceUser {
  userId: string;
  userName: string;
  color: string;
}

const STORAGE_KEY = "content-editor-presence-user";

function colorFromId(userId: string) {
  let hash = 0;

  for (const character of userId) {
    hash = character.charCodeAt(0) + ((hash << 5) - hash);
  }

  return `hsl(${Math.abs(hash) % 360} 70% 45%)`;
}

function getOrCreatePresenceUser(): StoredPresenceUser {
  const storedUser = sessionStorage.getItem(STORAGE_KEY);

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as StoredPresenceUser;

      if (parsed.userId && parsed.userName && parsed.color) {
        return parsed;
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  const userId = crypto.randomUUID();
  const user = {
    userId,
    userName: `Guest ${userId.slice(0, 4).toUpperCase()}`,
    color: colorFromId(userId),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}


