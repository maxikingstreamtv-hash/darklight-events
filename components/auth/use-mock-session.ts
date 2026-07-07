"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getMockSessionSnapshot,
  subscribeMockSession,
  type MockSession,
} from "@/components/auth/mock-auth";

export function useMockSession() {
  const snapshot = useSyncExternalStore(subscribeMockSession, getMockSessionSnapshot, () => "");

  return useMemo(() => {
    if (!snapshot) return null;

    try {
      return JSON.parse(snapshot) as MockSession;
    } catch {
      return null;
    }
  }, [snapshot]);
}
