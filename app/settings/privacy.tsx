import {
  SettingsNote,
  SettingsRow,
  SettingsScaffold,
  SettingsSection,
} from "../../components/SettingsScaffold";
import { useProfile } from "../../context/ProfileContext";
import { useTasks } from "../../context/TaskContext";

// ─── PRIVACY SETTINGS ─────────────────────────────────────────────────────────
// Taskly has no backend — everything lives in AsyncStorage on the device.
// This screen states that plainly and shows exactly what is stored.

export default function PrivacySettings() {
  const { tasks, categories } = useTasks();
  const { profile } = useProfile();

  const reminderCount = tasks.filter((t) => t.reminderTime).length;

  return (
    <SettingsScaffold subtitle="Your data never leaves this device.">
      <SettingsNote>
        Taskly has no account system and no server. Every task, category, and
        profile detail is stored locally in the app&apos;s own storage, and
        nothing is transmitted anywhere.
      </SettingsNote>

      <SettingsSection label="Stored on this device">
        <SettingsRow label="Tasks" value={`${tasks.length}`} />
        <SettingsRow label="Categories" value={`${categories.length}`} />
        <SettingsRow label="Scheduled reminders" value={`${reminderCount}`} />
        <SettingsRow
          label="Profile"
          value={profile.email ? "Name and email" : "Name only"}
          last
        />
      </SettingsSection>

      <SettingsSection label="Permissions used">
        <SettingsRow
          label="Notifications"
          value="Task reminders only"
          last
        />
      </SettingsSection>

      <SettingsNote>
        Deleting Taskly removes all of it. Because nothing is backed up to a
        server, uninstalling is permanent.
      </SettingsNote>
    </SettingsScaffold>
  );
}
