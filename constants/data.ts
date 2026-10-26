// ─── TYPES ────────────────────────────────────────────────────────────────────
export type Priority = "high" | "medium" | "low";

export interface Category {
  id: number;
  name: string;
  color: string; // key into CATEGORY_COLORS in theme.ts
}

export interface Subtask {
  id: number;
  title: string;
  done: boolean;
}

export interface Task {
  id: number;
  title: string;
  done: boolean;
  priority: Priority;
  date: string; // 'YYYY-MM-DD'
  category: string; // Category.name — old stored tasks already hold names, so no migration
  // Optional so tasks saved to AsyncStorage before these fields existed still parse as valid Tasks
  notes?: string;
  subtasks?: Subtask[];
  tags?: string[];
  // 'HH:MM' 24-hour, paired with `date` to form the reminder instant.
  // Undefined means no reminder. The scheduled notification's id is derived
  // from the task id, so it never needs storing here.
  reminderTime?: string;
}

// Shape of the user-editable fields — what add/update forms produce
export type TaskInput = Omit<Task, "id" | "done">;

export interface Profile {
  name: string;
  email: string;
}

export interface Reminder {
  id: number;
  title: string;
  time: string;
  days: string;
  active: boolean;
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
// fmt: turns a Date into a 'YYYY-MM-DD' string used as task date keys.
// Built from local date parts — toISOString() converts to UTC, which puts
// anything before the user's UTC offset (e.g. midnight–8 AM in UTC+8) on the
// previous day.
export const fmt = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// addDays: returns a new Date that is n days from d (negative = past)
export const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

// streakLength: consecutive days, counting back from today, that have at least
// one completed task. Today only counts once something is done, but an empty
// morning doesn't break a streak that yesterday kept alive.
export function streakLength(tasks: Task[], today: Date): number {
  const doneDates = new Set(tasks.filter((t) => t.done).map((t) => t.date));
  let day = doneDates.has(fmt(today)) ? today : addDays(today, -1);
  let count = 0;
  while (doneDates.has(fmt(day)) && count <= 365) {
    count++;
    day = addDays(day, -1);
  }
  return count;
}

// Only used to date the sample tasks below. Screens read the live date from
// useToday(), since a module-level date freezes at launch.
const TODAY = new Date();

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export const INITIAL_PROFILE: Profile = {
  name: "Master Keyt",
  email: "master.keyt@email.com",
};

// initials: derived from the name so it can never fall out of sync with it.
// Takes the first letter of the first two words; falls back to a leaf for blanks.
export const initials = (name: string): string => {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return letters || "🌿";
};

// ─── DEFAULT CATEGORIES ───────────────────────────────────────────────────────
export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Work", color: "plum" },
  { id: 2, name: "Personal", color: "violet" },
  { id: 3, name: "Health", color: "sage" },
];

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
