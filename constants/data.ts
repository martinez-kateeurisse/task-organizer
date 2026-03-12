// ─── TYPES ────────────────────────────────────────────────────────────────────
export type Priority = "high" | "medium" | "low";
export type Category = "Work" | "Personal" | "Health";

export interface Task {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
  date: string; // 'YYYY-MM-DD'
  category: Category;
}

export interface Reminder {
  id: number;
  title: string;
  time: string;
  days: string;
  active: boolean;
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
// fmt: turns a Date into a 'YYYY-MM-DD' string used as task date keys
export const fmt = (d: Date): string => d.toISOString().split("T")[0];

// addDays: returns a new Date that is n days from d (negative = past)
export const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const TODAY = new Date();

// ─── SAMPLE TASKS ─────────────────────────────────────────────────────────────
export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: "Buy groceries",
    done: false,
    priority: "high",
    date: fmt(TODAY),
    category: "Personal",
  },
  {
    id: 2,
    title: "Reply to client emails",
    done: false,
    priority: "high",
    date: fmt(TODAY),
    category: "Work",
  },
  {
    id: 3,
    title: "30-min workout",
    done: true,
    priority: "medium",
    date: fmt(TODAY),
    category: "Health",
  },
  {
    id: 4,
    title: "Review pull request",
    done: false,
    priority: "medium",
    date: fmt(TODAY),
    category: "Work",
  },
  {
    id: 5,
    title: "Read 20 pages",
    done: false,
    priority: "low",
    date: fmt(TODAY),
    category: "Personal",
  },
  {
    id: 6,
    title: "Schedule dentist",
    done: false,
    priority: "low",
    date: fmt(addDays(TODAY, 1)),
    category: "Health",
  },
  {
    id: 7,
    title: "Prepare presentation",
    done: false,
    priority: "high",
    date: fmt(addDays(TODAY, 1)),
    category: "Work",
  },
  {
    id: 8,
    title: "Call mom",
    done: true,
    priority: "medium",
    date: fmt(addDays(TODAY, 2)),
    category: "Personal",
  },
  {
    id: 9,
    title: "Pay electricity bill",
    done: false,
    priority: "high",
    date: fmt(addDays(TODAY, 3)),
    category: "Personal",
  },
  {
    id: 10,
    title: "Team standup notes",
    done: true,
    priority: "low",
    date: fmt(addDays(TODAY, 4)),
    category: "Work",
  },
  {
    id: 11,
    title: "Yoga session",
    done: true,
    priority: "medium",
    date: fmt(addDays(TODAY, -1)),
    category: "Health",
  },
  {
    id: 12,
    title: "Weekly review",
    done: true,
    priority: "high",
    date: fmt(addDays(TODAY, -1)),
    category: "Work",
  },
  {
    id: 13,
    title: "Grocery run",
    done: true,
    priority: "low",
    date: fmt(addDays(TODAY, -2)),
    category: "Personal",
  },
];

// ─── WEEKLY STATS ─────────────────────────────────────────────────────────────
// Hardcoded for the Stats screen bar chart (will be computed from real data later)
export const WEEKLY_STATS = [
  { day: "Mon", done: 3, total: 4 },
  { day: "Tue", done: 5, total: 5 },
  { day: "Wed", done: 2, total: 6 },
  { day: "Thu", done: 4, total: 4 },
  { day: "Fri", done: 1, total: 3 },
  { day: "Sat", done: 6, total: 7 },
  { day: "Sun", done: 3, total: 3 },
];

// ─── REMINDERS ────────────────────────────────────────────────────────────────
export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 1,
    title: "Morning planning",
    time: "08:00 AM",
    days: "Every day",
    active: true,
  },
  {
    id: 2,
    title: "Work focus block",
    time: "09:30 AM",
    days: "Mon – Fri",
    active: true,
  },
  {
    id: 3,
    title: "End-of-day review",
    time: "06:00 PM",
    days: "Every day",
    active: false,
  },
  {
    id: 4,
    title: "Weekend reflection",
    time: "10:00 AM",
    days: "Sat & Sun",
    active: true,
  },
];
