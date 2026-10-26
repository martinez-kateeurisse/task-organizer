import { useEffect, useState } from "react";
import { AppState } from "react-native";

// ─── TODAY HOOK ───────────────────────────────────────────────────────────────
// The current date, kept fresh. A plain `new Date()` captured once goes stale
// if the app stays open past midnight or sits in the background overnight, so
// this re-renders the caller at midnight and whenever the app returns to the
// foreground.

export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const refresh = () => setToday(new Date());

    // Re-armed after every refresh, since `today` is a dependency
    const midnight = new Date(today);
    midnight.setHours(24, 0, 0, 0);
    const timer = setTimeout(refresh, midnight.getTime() - today.getTime());

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [today]);

  return today;
}
