import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { INITIAL_REMINDERS, Reminder } from "../constants/data";
import type { TaskFilterPrefs } from "../hooks/useTaskFilters";
import { syncReminder } from "../utils/notifications";

// ─── PREFERENCES CONTEXT ──────────────────────────────────────────────────────
// Small persisted settings that aren't task data: whether the intro has been
// seen, each screen's filter/sort choices, and which Profile reminders are on.
//
// The provider renders nothing until the read finishes, so consumers can treat
// stored values as available synchronously — that lets useTaskFilters seed its
// initial state directly instead of flashing defaults then correcting.

interface Prefs {
  onboarded: boolean;
  // Keyed by screen ("dashboard", "calendar") so their filters stay separate.
  filters: Record<string, TaskFilterPrefs>;
  // Only the on/off state is stored, keyed by reminder id. The reminders
  // themselves are fixed, and an id with no entry uses its default.
  remindersActive: Record<number, boolean>;
}

const DEFAULT_PREFS: Prefs = {
  onboarded: false,
  filters: {},
  remindersActive: {},
};

const withActive = (p: Prefs): Reminder[] =>
  INITIAL_REMINDERS.map((r) => ({
    ...r,
    active: p.remindersActive[r.id] ?? r.active,
  }));

interface PreferencesContextType {
  loading: boolean;
  onboarded: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  getFilters: (key: string) => TaskFilterPrefs | undefined;
  saveFilters: (key: string, prefs: TaskFilterPrefs) => void;
  reminders: Reminder[];
  setReminderActive: (id: number, active: boolean) => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

const PREFS_KEY = "taskly:prefs";

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  // Mirrors `prefs`, but updated synchronously. Two screens saving their
  // filters in the same batch would otherwise both read the pre-batch state
  // and the second write would clobber the first.
  const prefsRef = useRef(prefs);

  function commit(next: Prefs) {
    prefsRef.current = next;
    setPrefs(next);
  }

  useEffect(() => {
    async function loadPrefs() {
      try {
        const stored = await AsyncStorage.getItem(PREFS_KEY);
        if (stored !== null) {
          commit({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
        }
      } catch {
        // fall back to defaults
      } finally {
        setLoading(false);
      }
      // Notifications live in the OS, not in storage, so re-syncing on launch
      // makes the schedule match the toggles — including reminders that
      // default to on and have never been scheduled.
      withActive(prefsRef.current).forEach((r) => syncReminder(r));
    }
    loadPrefs();
  }, []);

  function update(next: Prefs) {
    commit(next);
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
  }

  function completeOnboarding() {
    update({ ...prefsRef.current, onboarded: true });
  }

  function resetOnboarding() {
    update({ ...prefsRef.current, onboarded: false });
  }

  function getFilters(key: string) {
    return prefsRef.current.filters[key];
  }

  function saveFilters(key: string, next: TaskFilterPrefs) {
    const current = prefsRef.current;
    update({
      ...current,
      filters: { ...current.filters, [key]: next },
    });
  }

  function setReminderActive(id: number, active: boolean) {
    const current = prefsRef.current;
    const next = {
      ...current,
      remindersActive: { ...current.remindersActive, [id]: active },
    };
    update(next);
    const reminder = withActive(next).find((r) => r.id === id);
    if (reminder) syncReminder(reminder);
  }

  if (loading) return null;

  return (
    <PreferencesContext.Provider
      value={{
        loading,
        onboarded: prefs.onboarded,
        completeOnboarding,
        resetOnboarding,
        getFilters,
        saveFilters,
        reminders: withActive(prefs),
        setReminderActive,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx)
    throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}
