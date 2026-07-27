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
import SearchBar from "../../components/SearchBar";
import TaskDetailModal from "../../components/TaskDetailModal";
import TaskFilterBar from "../../components/TaskFilterBar";
import TaskRow from "../../components/TaskRow";
import { addDays, fmt, Task, TODAY } from "../../constants/data";
import { FONTS, onGradientAlpha, Palette } from "../../constants/theme";
import { useStyles } from "../../context/ThemeContext";
import { useDeleteWithUndo } from "../../hooks/useDeleteWithUndo";
import { useTasks } from "../../context/TaskContext";
import { useTaskFilters } from "../../hooks/useTaskFilters";

// ─── DASHBOARD SCREEN ─────────────────────────────────────────────────────────
// Home tab: greeting, circular progress ring, stat chips, today's task list.
// useTasks() pulls tasks and toggleTask from TaskContext — no props needed.

export default function DashboardScreen() {
  const { P, styles } = useStyles(makeStyles);
  const { tasks, toggleTask, markAllDone } = useTasks();
  const deleteWithUndo = useDeleteWithUndo();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const filters = useTaskFilters("dashboard");

  const todayStr = fmt(TODAY);
  const allTodayTasks = tasks.filter((t) => t.date === todayStr);
  const todayTasks = filters.apply(allTodayTasks);
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

  // Search spans every task, not just today's, and respects the active filters
  const searchResults = filters.isSearching ? filters.search(tasks) : [];

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

        {/* Search bar */}
        <SearchBar
          value={filters.searchQuery}
          onChange={filters.setSearchQuery}
        />

        {/* Progress card — LinearGradient replaces CSS radial-gradient */}
        <LinearGradient
          colors={[P.heroFrom, P.heroTo]}
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
              stroke={onGradientAlpha(0.15)}
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
              fill={P.onGradient}
              fontFamily={FONTS.sansBold}
              fontSize="15"
            >
              {done}
            </SvgText>
            <SvgText
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fill={onGradientAlpha(0.5)}
              fontFamily={FONTS.sans}
              fontSize="11"
            >
              of {total}
            </SvgText>
          </Svg>

          <View style={styles.progressText}>
            <Text style={styles.progressLabel}>Today&apos;s Progress</Text>
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

        {/* ── Search results — replaces normal layout when searching ── */}
        {filters.isSearching && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Results</Text>
              <Text style={styles.sectionCount}>
                {searchResults.length} tasks
              </Text>
            </View>
            {searchResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No tasks found</Text>
                <Text style={styles.emptySubtitle}>
                  Try a different search term
                </Text>
              </View>
            ) : (
              searchResults.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={toggleTask}
                  onEdit={setEditingTask}
                  onDetail={setDetailTask}
                />
              ))
            )}
          </>
        )}

        {/* ── Normal layout — hidden while searching ── */}
        {!filters.isSearching && (
          <>
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
              <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Text style={styles.sectionCount}>
                  {todayTasks.length} tasks
                </Text>
                {/* Only show the button when there are incomplete tasks today */}
                {allTodayTasks.some((t) => !t.done) && (
                  <TouchableOpacity
                    onPress={() => markAllDone(todayStr)}
                    activeOpacity={0.7}
                    style={styles.markAllBtn}
                  >
                    <Text style={styles.markAllText}>Mark all done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TaskFilterBar
              priorityFilter={filters.priorityFilter}
              onPriorityChange={filters.setPriorityFilter}
              statusFilter={filters.statusFilter}
              onStatusChange={filters.setStatusFilter}
              sortBy={filters.sortBy}
              onCycleSort={filters.cycleSort}
            />

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
                  onDetail={setDetailTask}
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
                    onDetail={setDetailTask}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* EditTaskModal sits outside ScrollView so it overlays the whole screen */}
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={(task) => {
          setDetailTask(null);
          setEditingTask(task);
        }}
        onDelete={(task) => {
          setDetailTask(null);
          deleteWithUndo(task);
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (P: Palette) => StyleSheet.create({
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
    shadowColor: P.shadow,
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
    color: onGradientAlpha(0.6),
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  progressValue: {
    color: P.onGradient,
    fontSize: 20,
    fontFamily: FONTS.serif,
    lineHeight: 26,
  },
  progressTrack: {
    height: 4,
    width: 140,
    backgroundColor: onGradientAlpha(0.2),
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
  markAllBtn: {
    backgroundColor: P.plumLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  markAllText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: P.plum,
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
