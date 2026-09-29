import { useState, useEffect, useCallback } from "react";
import { listMeetings } from "@/lib/api";
import type { Meeting, MeetingListFilter } from "@/types";

export function useMeetings(filter: MeetingListFilter = "upcoming") {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listMeetings(filter);
      setMeetings(data);
    } catch {
      // Silently fail; card shows empty state if needed.
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    async function load() {
      await fetchList();
    }
    load();
  }, [fetchList]);

  // Refetch when tab regains focus (D11: no WebSockets / background polling)
  useEffect(() => {
    const onFocus = () => fetchList();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") fetchList();
    });
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchList]);

  return { meetings, loading, refetch: fetchList };
}
