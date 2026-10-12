"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase Realtime WebSocket Hook for Student Management
 * Automatically listens for PostgreSQL CDC events (INSERT, UPDATE, DELETE)
 * on the public.Student table and invalidates TanStack Query cache.
 */
export function useStudentRealtime(onDatabaseChange: () => void) {
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("student-realtime-portal")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Student",
        },
        () => {
          // Trigger instant cache refresh
          onDatabaseChange();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onDatabaseChange]);

  return { isConnected };
}
