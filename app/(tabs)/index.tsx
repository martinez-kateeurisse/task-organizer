import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import EditTaskModal from "../../components/EditTaskModal";
import TaskRow from "../../components/TaskRow";
import { addDays, fmt, Task, TODAY } from "../../constants/data";
import { FONTS, P, PRIORITY } from "../../constants/theme";
import { useTasks } from "../../context/TaskContext";

// ─── DASHBOARD SCREEN ─────────────────────────────────────────────────────────
// Home tab: greeting, circular progress ring, stat chips, today's task list.
// useTasks() pulls tasks and toggleTask from TaskContext — no props needed.

export default function DashboardScreen() {
  const { tasks, toggleTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  const todayStr = fmt(TODAY);
  const allTodayTasks = tasks.filter((t) => t.date === todayStr);
  // If a filter is active, only show tasks matching that priority
  const todayTasks =
    priorityFilter === "all"
      ? allTodayTasks
      : allTodayTasks.filter((t) => t.priority === priorityFilter);
  const done = todayTasks.filter((t) => t.done).length;
  const total = todayTasks.length;
  const pct = total === 0 ? 0 : done / total;

  // SVG ring math — r=38, circumference = 2π × 38 ≈ 238.76
  const R = 38;
  const circ = 2 * Math.PI * R;
  const cx = R + 10; // center x/y within the SVG viewport
  const cy = R + 10;

  const dateStr = TODAY.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const hr = TODAY.getHours();
  const greeting =
    hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";

  // Upcoming tasks — due in the next 3 days, excluding today, not yet done
  // We build an array of the next 3 date strings and filter tasks against them
  const upcomingTasks = tasks
    .filter((t) => {
      if (t.done) return false;
      const next3 = [1, 2, 3].map((n) => fmt(addDays(TODAY, n)));
      return next3.includes(t.date);
    })
    .sort((a, b) => a.date.localeCompare(b.date)); // sort by nearest date first

  const statChips = [
    {
      label: "Pending",
      value: tasks.filter((t) => !t.done).length,
      color: P.plum,
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.done).length,
      color: P.sage,
    },
    { label: "Total", value: tasks.length, color: P.lavender },
  ];

  return (
    // SafeAreaView respects the notch and home indicator so content isn't clipped
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.greeting}>{greeting} 🌿</Text>
        </View>

        {/* Progress card — LinearGradient replaces CSS radial-gradient */}
        <LinearGradient
          colors={[P.plum, "#3D2855"]}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.progressCard}
        >
          {/* SVG circular progress ring */}
          <Svg width={cx * 2} height={cy * 2}>
            {/* Grey track — the full circle in the background */}
            <Circle
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={7}
            />
            {/* Sage arc — only draws pct fraction of the circle.
                rotation={-90} makes the arc start at 12 o'clock instead of 3 o'clock */}
            <Circle
              cx={cx}
              cy={cy}
              r={R}
              fill="none"
              stroke={P.sage}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={`${circ * pct} ${circ}`}
              rotation={-90}
              originX={cx}
              originY={cy}
            />
            {/* Done count centered in the ring */}
            <SvgText
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fill="white"
              fontFamily={FONTS.sansBold}
              fontSize="15"
            >
              {done}
            </SvgText>
            <SvgText
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontFamily={FONTS.sans}
              fontSize="11"
            >
              of {total}
            </SvgText>
          </Svg>

          <View style={styles.progressText}>
            <Text style={styles.progressLabel}>Today's Progress</Text>
            <Text style={styles.progressValue}>
              {done === total && total > 0
                ? "All done! 🎉"
                : `${total - done} remaining`}
            </Text>
            {/* Slim progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
            </View>
            <Text style={styles.progressPct}>
              {Math.round(pct * 100)}% complete
            </Text>
          </View>
        </LinearGradient>

        {/* Stat chips row */}
        <View style={styles.chipsRow}>
          {statChips.map((s) => (
            <View key={s.label} style={styles.chip}>
              <Text style={[styles.chipValue, { color: s.color }]}>
                {s.value}
              </Text>
              <Text style={styles.chipLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Today task list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <Text style={styles.sectionCount}>{todayTasks.length} tasks</Text>
        </View>

        {/* Priority filter badges — tapping one filters the task list */}
        <View style={styles.filterRow}>
          {(["all", "high", "medium", "low"] as const).map((f) => {
            const active = priorityFilter === f;
            const color = f === "all" ? P.plum : PRIORITY[f].dot;
            const bg = f === "all" ? P.plumLight : PRIORITY[f].bg;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setPriorityFilter(f)}
                activeOpacity={0.7}
                style={[
                  styles.filterBadge,
                  active && { backgroundColor: bg, borderColor: color },
                ]}
              >
                {f !== "all" && (
                  <View
                    style={[
                      styles.filterDot,
                      { backgroundColor: active ? color : P.border },
                    ]}
                  />
                )}
                <Text style={[styles.filterText, active && { color }]}>
                  {f === "all" ? "All" : PRIORITY[f].label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {todayTasks.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyState}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/add-task")}
          >
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>No tasks for today</Text>
            <Text style={styles.emptySubtitle}>Tap here to add one</Text>
          </TouchableOpacity>
        ) : (
          todayTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={toggleTask}
              onEdit={setEditingTask}
            />
          ))
        )}

        {/* Upcoming tasks — only shown if there are tasks in the next 3 days */}
        {upcomingTasks.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 28 }]}>
              <Text style={styles.sectionTitle}>Coming Up</Text>
              <Text style={styles.sectionCount}>
                {upcomingTasks.length} tasks
              </Text>
            </View>
            {upcomingTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onToggle={toggleTask}
                onEdit={setEditingTask}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* EditTaskModal sits outside ScrollView so it overlays the whole screen */}
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.lilac,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 28,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 11,
    color: P.textSoft,
    fontFamily: FONTS.sansBold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  greeting: {
    fontSize: 30,
    fontFamily: FONTS.serif,
    color: P.textDark,
    marginTop: 4,
    lineHeight: 36,
  },
  progressCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    // iOS shadow
    shadowColor: P.plum,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    // Android shadow
    elevation: 10,
  },
  progressText: {
    flex: 1,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  progressValue: {
    color: "white",
    fontSize: 20,
    fontFamily: FONTS.serif,
    lineHeight: 26,
  },
  progressTrack: {
    height: 4,
    width: 140,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    marginTop: 10,
    overflow: "hidden", // clips the fill bar to the track's rounded corners
  },
  progressFill: {
    height: "100%",
    backgroundColor: P.sage,
    borderRadius: 4,
  },
  progressPct: {
    color: P.sage,
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    marginTop: 5,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    flex: 1,
    backgroundColor: P.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: P.border,
  },
  chipValue: {
    fontSize: 22,
    fontFamily: FONTS.sansBold,
  },
  chipLabel: {
    fontSize: 10,
    color: P.textSoft,
    fontFamily: FONTS.sansBold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: P.textDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontSize: 12,
    color: P.textSoft,
    fontFamily: FONTS.sans,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: P.textSoft,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: P.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: P.border,
    marginTop: 4,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONTS.serif,
    color: P.textDark,
    marginBottom: 4,
  },
  emptySubtitle: { fontSize: 13, fontFamily: FONTS.sans, color: P.textSoft },
});
