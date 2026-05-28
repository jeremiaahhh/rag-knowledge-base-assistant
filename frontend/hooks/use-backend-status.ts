"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

type Status = "checking" | "online" | "offline";

interface BackendStatus {
  status: Status;
  health: HealthResponse | null;
}

export function useBackendStatus(pollMs = 15000): BackendStatus {
  const [state, setState] = useState<BackendStatus>({
    status: "checking",
    health: null,
  });

  useEffect(() => {
    let active = true;

    async function ping() {
      try {
        const health = await api.health();
        if (active) setState({ status: "online", health });
      } catch {
        if (active) setState({ status: "offline", health: null });
      }
    }

    ping();
    const id = setInterval(ping, pollMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [pollMs]);

  return state;
}
