import { useState } from "react";
import { Task } from "../constants/data";

// ─── TASK FILTERS HOOK ────────────────────────────────────────────────────────
// Owns the search / priority / status / sort state shared by Dashboard and
// Calendar, plus the pure apply() that runs them over a task list.
//
// Each screen calls this independently, so their filter selections stay separate.
// Centralising it here means Phase 3's persisted preferences only need wiring
// in one place.

export type PriorityFilter = "all" | "high" | "medium" | "low";
export type StatusFilter = "all" | "pending" | "done";
export type SortBy = "date" | "priority" | "title";

export const SORT_LABELS: Record<SortBy, string> = {
  date: "By Date",
  priority: "By Priority",
  title: "By Title",
};

const SORT_ORDER: SortBy[] = ["date", "priority", "title"];
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

// Searches title, tags, and notes — the fields a user would expect to recall a
// task by. Tags and notes are optional, so both are guarded.
export function matchesSearch(task: Task, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (task.title.toLowerCase().includes(q)) return true;
  if (task.notes?.toLowerCase().includes(q)) return true;
  return (task.tags ?? []).some((tag) => tag.toLowerCase().includes(q));
}

export function useTaskFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");

  const isSearching = searchQuery.trim().length > 0;

  function cycleSort() {
    setSortBy(
      (prev) => SORT_ORDER[(SORT_ORDER.indexOf(prev) + 1) % SORT_ORDER.length],
    );
  }

  // Returns a new array — sort() mutates in place, so the input is copied first
  // to avoid reordering the caller's list (and the context's task array).
  function apply(list: Task[]): Task[] {
    return [...list]
      .filter((t) =>
        priorityFilter === "all" ? true : t.priority === priorityFilter,
      )
      .filter((t) =>
        statusFilter === "all"
          ? true
          : statusFilter === "done"
            ? t.done
            : !t.done,
      )
      .sort((a, b) => {
        if (sortBy === "priority")
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return a.date.localeCompare(b.date);
      });
  }

  // Search results ignore the date scoping of the calling screen: searching is
  // a "find it anywhere" action, but still respects the active filters and sort.
  function search(allTasks: Task[]): Task[] {
    return apply(allTasks.filter((t) => matchesSearch(t, searchQuery)));
  }

  return {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    cycleSort,
    isSearching,
    apply,
    search,
  };
}
