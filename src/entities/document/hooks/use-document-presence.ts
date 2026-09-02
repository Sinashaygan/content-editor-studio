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


