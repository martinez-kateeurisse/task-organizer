import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { INITIAL_PROFILE, Profile } from "../constants/data";

// ─── CONTEXT TYPE ─────────────────────────────────────────────────────────────
// Kept separate from TaskContext: profile data is unrelated to tasks, so mixing
// them would re-render every task consumer on a profile edit.
interface ProfileContextType {
  profile: Profile;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => void;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

const PROFILE_KEY = "taskly:profile";

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);

  // ── Load ──────────────────────────────────────────────────────────────────
  // Spread over INITIAL_PROFILE so a stored object written before a field
  // existed still comes back with every key present.
  useEffect(() => {
    async function loadProfile() {
      try {
        const stored = await AsyncStorage.getItem(PROFILE_KEY);
        if (stored !== null) {
          setProfile({ ...INITIAL_PROFILE, ...JSON.parse(stored) });
        }
      } catch {
        setProfile(INITIAL_PROFILE);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  // Guarded on loading so the initial default never overwrites stored data
  // before the read finishes.
  useEffect(() => {
    async function saveProfile() {
      try {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      } catch {
        // storage write failed — silently ignore for now
      }
    }
    if (!loading) saveProfile();
  }, [profile, loading]);

  function updateProfile(updates: Partial<Profile>) {
    setProfile((prev) => ({ ...prev, ...updates }));
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
